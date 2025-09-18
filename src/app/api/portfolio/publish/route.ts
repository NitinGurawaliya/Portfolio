import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      portfolioData, 
      selectedRepos, 
      skills, 
      deployedUrls,
      userId,
      userData 
    } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First, ensure user exists in database
      const user = await tx.user.upsert({
        where: { githubId: userId.toString() },
        update: {
          name: userData?.name || "",
          email: userData?.email || "",
          githubUsername: userData?.githubUsername || "",
          avatarUrl: userData?.avatarUrl || "",
          bio: userData?.bio || "",
          location: userData?.location || "",
          websiteUrl: userData?.websiteUrl || "",
          twitterUsername: userData?.twitterUsername || "",
          company: userData?.company || "",
          publicRepos: userData?.publicRepos || 0,
          followers: userData?.followers || 0,
          following: userData?.following || 0,
        },
        create: {
          githubId: userId.toString(),
          name: userData?.name || "",
          email: userData?.email || "",
          githubUsername: userData?.githubUsername || "",
          avatarUrl: userData?.avatarUrl || "",
          bio: userData?.bio || "",
          location: userData?.location || "",
          websiteUrl: userData?.websiteUrl || "",
          twitterUsername: userData?.twitterUsername || "",
          company: userData?.company || "",
          publicRepos: userData?.publicRepos || 0,
          followers: userData?.followers || 0,
          following: userData?.following || 0,
        },
      })

      // Upsert portfolio (create or update)
      const portfolio = await tx.portfolio.upsert({
        where: { userId: user.id },
        update: {
          displayName: portfolioData.displayName,
          jobTitle: portfolioData.jobTitle,
          bio: portfolioData.bio,
          profilePic: portfolioData.profilePic,
          customUsername: portfolioData.customUsername,
          isPublished: true,
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          displayName: portfolioData.displayName,
          jobTitle: portfolioData.jobTitle,
          bio: portfolioData.bio,
          profilePic: portfolioData.profilePic,
          customUsername: portfolioData.customUsername,
          isPublished: true,
        },
      })

      // Delete existing skills and portfolio repositories
      await tx.skill.deleteMany({
        where: { portfolioId: portfolio.id }
      })

      await tx.portfolioRepository.deleteMany({
        where: { portfolioId: portfolio.id }
      })

      // Add new skills
      if (skills && skills.length > 0) {
        await tx.skill.createMany({
          data: skills.map((skill: any) => ({
            name: skill.name,
            category: skill.category,
            portfolioId: portfolio.id,
          }))
        })
      }

      // Add selected repositories
      if (selectedRepos && selectedRepos.length > 0) {
        const portfolioRepos = selectedRepos.map((repoId: number) => ({
          portfolioId: portfolio.id,
          repositoryId: repoId,
          deployedUrl: deployedUrls[repoId] || null,
          isVisible: true,
        }))

        await tx.portfolioRepository.createMany({
          data: portfolioRepos
        })
      }

      return portfolio
    })

    return NextResponse.json({
      success: true,
      message: "Portfolio published successfully",
      portfolio: result
    })

  } catch (error) {
    console.error("Error publishing portfolio:", error)
    return NextResponse.json(
      { error: "Failed to publish portfolio" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    const userId = searchParams.get("userId")

    if (!username && !userId) {
      return NextResponse.json(
        { error: "Username or User ID is required" },
        { status: 400 }
      )
    }

    let whereClause: any = { isPublished: true }

    if (userId) {
      whereClause.userId = parseInt(userId)
    } else if (username) {
      // Search by custom username first, then fall back to GitHub username
      whereClause.OR = [
        { customUsername: username },
        { user: { githubUsername: username } }
      ]
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: whereClause,
      include: {
        user: true,
        skills: true,
        socials: true,
        repositories: {
          include: {
            repository: {
              select: {
                id: true,
                githubId: true,
                name: true,
                fullName: true,
                description: true,
                htmlUrl: true,
                language: true,
                stargazersCount: true,
                forksCount: true,
                size: true,
                isPrivate: true,
                isFork: true,
                isImported: true,
                createdAt: true,
                updatedAt: true,
                pushedAt: true
              }
            }
          }
        }
      }
    })

    console.log("Searching for portfolio with:", whereClause)
    console.log("Found portfolio:", JSON.stringify(portfolio, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2))

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found. Please save at least one section in the dashboard first." },
        { status: 404 }
      )
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedPortfolio = JSON.parse(JSON.stringify(portfolio, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))

    return NextResponse.json({
      success: true,
      portfolio: serializedPortfolio
    })

  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
