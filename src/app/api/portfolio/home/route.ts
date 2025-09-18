import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      portfolioData,
      userId,
      userData 
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Handle empty email to avoid unique constraint issues
    const userEmail = userData?.email && userData.email.trim() 
      ? userData.email.trim() 
      : `github-${userId}@placeholder.com`

    const result = await prisma.$transaction(async (tx) => {
      // Ensure user exists
      const user = await tx.user.upsert({
        where: { githubId: userId.toString() },
        update: {
          name: userData?.name || "",
          email: userEmail,
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
          email: userEmail,
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

      // Upsert portfolio home section
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

      return portfolio
    })

    return NextResponse.json({
      success: true,
      message: "Home section saved successfully",
      portfolio: result
    })

  } catch (error) {
    console.error("Error saving home section:", error)
    return NextResponse.json(
      { error: "Failed to save home section" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
