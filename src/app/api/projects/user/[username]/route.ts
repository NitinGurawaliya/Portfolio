import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getProjectSlugMap } from "@/lib/project-slug"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        isPublished: true,
        OR: [
          { customUsername: username },
          { user: { githubUsername: username } },
        ],
      },
      select: {
        id: true,
        repositories: {
          where: {
            isVisible: true,
            deletedAt: null,
          },
          orderBy: [
            {
              displayOrder: "asc",
            },
            {
              createdAt: "desc",
            },
          ],
          select: {
            id: true,
            customName: true,
            customDescription: true,
            deployedUrl: true,
            technologies: true,
            projectCategory: true,
            projectStatus: true,
            projectRevenue: true,
            projectMrr: true,
            projectUsers: true,
            createdAt: true,
            updatedAt: true,
            repository: {
              select: {
                id: true,
                name: true,
                description: true,
                htmlUrl: true,
                githubUrl: true,
                favicon: true,
                logo: true,
                language: true,
                languages: true,
              },
            },
          },
        },
      },
    })

    if (!portfolio || portfolio.repositories.length === 0) {
      return NextResponse.json(
        { error: "No projects found for this user" },
        { status: 404 }
      )
    }

    const slugMap = getProjectSlugMap(portfolio.repositories)

    const projects = portfolio.repositories.map((project) => {
      const title = project.customName || project.repository?.name || ""
      const description = project.customDescription || project.repository?.description || ""

      return {
        id: project.id,
        title,
        description,
        deployedUrl: project.deployedUrl,
        githubUrl: project.repository?.githubUrl || project.repository?.htmlUrl,
        favicon: project.repository?.favicon,
        logo: project.repository?.logo,
        category: project.projectCategory,
        status: project.projectStatus,
        revenue: project.projectRevenue,
        mrr: project.projectMrr,
        users: project.projectUsers,
        slug: slugMap[project.id] || `project-${project.id}`,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      projects,
    })
  } catch (error) {
    console.error("❌ User projects API failed:", error)
    return NextResponse.json(
      {
        error: "Failed to load projects",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

