import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      skills,
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

      // Get or create portfolio
      let portfolio = await tx.portfolio.findUnique({
        where: { userId: user.id }
      })

      if (!portfolio) {
        portfolio = await tx.portfolio.create({
          data: {
            userId: user.id,
            displayName: userData?.name || "",
            bio: userData?.bio || "",
            profilePic: userData?.avatarUrl || "",
            customUsername: userData?.githubUsername || "",
            isPublished: true,
          }
        })
      } else {
        // Update existing portfolio to be published
        portfolio = await tx.portfolio.update({
          where: { userId: user.id },
          data: { isPublished: true }
        })
      }

      // Delete existing skills
      await tx.skill.deleteMany({
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

      return { portfolio, skills }
    })

    return NextResponse.json({
      success: true,
      message: "Skills saved successfully",
      data: result
    })

  } catch (error) {
    console.error("Error saving skills:", error)
    return NextResponse.json(
      { error: "Failed to save skills" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
