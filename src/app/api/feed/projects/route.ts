import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"

type SortOption = "newest" | "most_upvoted" | "most_viewed"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sort = (searchParams.get("sort") as SortOption) ?? "newest"

    const currentUserId = await resolveCurrentUserId(req)

    const projects = await prisma.portfolioRepository.findMany({
      where: {
        deletedAt: null,
        isVisible: true,
        portfolio: {
          isPublished: true,
        },
      },
      include: {
        repository: {
          select: {
            id: true,
            name: true,
            description: true,
            htmlUrl: true,
            favicon: true,
            logo: true,
            githubUrl: true,
          },
        },
        portfolio: {
          select: {
            id: true,
            displayName: true,
            customUsername: true,
            user: {
              select: {
                id: true,
                name: true,
                githubUsername: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const projectIds = projects.map((project) => project.id)
    const viewsMap = new Map<number, number>()
    const upvotesMap = new Map<number, number>()

    if (projectIds.length > 0) {
      const dailyViews = await prisma.dailyProjectViews.groupBy({
        by: ["projectId"],
        where: {
          projectId: { in: projectIds.map((id) => BigInt(id)) },
        },
        _sum: {
          views: true,
        },
      })

      dailyViews.forEach((entry) => {
        const projectIdNumber = Number(entry.projectId)
        const totalViews = entry._sum.views ?? 0
        viewsMap.set(projectIdNumber, totalViews)
      })

      const upvoteRows = await prisma.projectUpvote.findMany({
        where: {
          portfolioRepositoryId: { in: projectIds },
        },
        select: {
          portfolioRepositoryId: true,
        },
      })

      for (const { portfolioRepositoryId } of upvoteRows) {
        const current = upvotesMap.get(portfolioRepositoryId) ?? 0
        upvotesMap.set(portfolioRepositoryId, current + 1)
      }
    }

    let userUpvoteSet = new Set<number>()

    if (currentUserId && projectIds.length > 0) {
      const userUpvotes = await prisma.projectUpvote.findMany({
        where: {
          userId: currentUserId,
          portfolioRepositoryId: { in: projectIds },
        },
        select: {
          portfolioRepositoryId: true,
        },
      })

      userUpvoteSet = new Set(
        userUpvotes.map(({ portfolioRepositoryId }) => portfolioRepositoryId)
      )
    }

    const normalizedProjects = projects.map((project) => {
      const title = project.customName ?? project.repository.name
      const description = project.customDescription ?? project.repository.description ?? ""
      const totalViews = viewsMap.get(project.id) ?? 0
      const upvotes = upvotesMap.get(project.id) ?? 0
      const profileSlug =
        project.portfolio.customUsername ||
        project.portfolio.user?.githubUsername ||
        ""

      return {
        id: project.id,
        portfolioId: project.portfolioId,
        repositoryId: project.repositoryId,
        title,
        description,
        deployedUrl: project.deployedUrl,
        githubUrl: project.repository.githubUrl ?? project.repository.htmlUrl,
        favicon: project.repository.favicon,
        logo: project.repository.logo,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        upvotes,
        views: totalViews,
        hasUpvoted: userUpvoteSet.has(project.id),
        author: {
          id: project.portfolio.user?.id ?? null,
          name:
            project.portfolio.displayName ||
            project.portfolio.user?.name ||
            project.portfolio.user?.githubUsername ||
            "Unknown",
          githubUsername: project.portfolio.user?.githubUsername,
          avatarUrl: project.portfolio.user?.avatarUrl,
          portfolioSlug: profileSlug,
        },
      }
    })

    const sortedProjects = [...normalizedProjects]

    if (sort === "most_upvoted") {
      sortedProjects.sort((a, b) => {
        if (b.upvotes === a.upvotes) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return b.upvotes - a.upvotes
      })
    } else if (sort === "most_viewed") {
      sortedProjects.sort((a, b) => {
        if (b.views === a.views) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return b.views - a.views
      })
    } else {
      // newest (default)
      sortedProjects.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    return NextResponse.json({
      sort,
      projects: sortedProjects,
    })
  } catch (error) {
    console.error("❌ Feed: Failed to fetch projects:", error)
    return NextResponse.json(
      { error: "Failed to load project feed" },
      { status: 500 }
    )
  }
}
