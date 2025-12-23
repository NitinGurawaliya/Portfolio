import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { validateSession } from "@/lib/session-validator"
import { normalizeUserEmail } from "@/lib/utils/user-utils"

export async function POST(req: NextRequest) {
  try {
    const sessionValidation = await validateSession(req)
    if (!sessionValidation.valid || !sessionValidation.userId) {
      return NextResponse.json(
        { error: sessionValidation.error || "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { 
      portfolioData,
      userId: requestedUserId,
      userData 
    } = body

    // Backward-compatible: if userId was provided, it must match session
    if (requestedUserId && requestedUserId.toString() !== sessionValidation.userId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only modify your own portfolio" },
        { status: 403 }
      )
    }

    const userId = sessionValidation.userId
    const existingUser = await prisma.user.findUnique({
      where: { githubId: userId.toString() },
      select: { email: true },
    })

    const userEmail = normalizeUserEmail({
      userId: userId.toString(),
      existingUserEmail: existingUser?.email,
      incomingEmail: userData?.email,
    })

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
    // Do not disconnect global prisma; connection is managed centrally
  }
}
