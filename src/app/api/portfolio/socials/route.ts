import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Platform URL generators
const generatePlatformUrl = (platform: string, username: string): string => {
  const platforms: Record<string, string> = {
    github: `https://github.com/${username}`,
    twitter: `https://twitter.com/${username}`,
    linkedin: `https://linkedin.com/in/${username}`,
    instagram: `https://instagram.com/${username}`,
    facebook: `https://facebook.com/${username}`,
    youtube: `https://youtube.com/@${username}`,
    stackoverflow: `https://stackoverflow.com/users/${username}`,
    reddit: `https://reddit.com/u/${username}`,
  }
  return platforms[platform] || `https://${platform}.com/${username}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { socials, userId, userData } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Ensure user exists
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

      // Ensure portfolio exists
      const portfolio = await tx.portfolio.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          isPublished: false,
        },
      })

      // Delete existing socials and recreate
      await tx.social.deleteMany({
        where: { portfolioId: portfolio.id }
      })

      // Add new socials
      if (socials && socials.length > 0) {
        await tx.social.createMany({
          data: socials.map((social: any) => ({
            portfolioId: portfolio.id,
            platform: social.platform,
            username: social.username,
            url: social.url || generatePlatformUrl(social.platform, social.username),
            isPinned: social.isPinned || false,
          }))
        })
      }

      return portfolio
    })

    return NextResponse.json({
      success: true,
      message: "Social accounts saved successfully",
      portfolio: result
    })

  } catch (error) {
    console.error("Error saving social accounts:", error)
    return NextResponse.json(
      { error: "Failed to save social accounts" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        user: { githubId: userId }
      },
      include: {
        socials: true
      }
    })

    return NextResponse.json({
      success: true,
      socials: portfolio?.socials || []
    })

  } catch (error) {
    console.error("Error fetching social accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch social accounts" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
