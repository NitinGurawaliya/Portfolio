import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { devLog } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      githubId, 
      name, 
      description 
    } = body

    devLog("Updating repository:", { githubId, name, description })

    if (!githubId) {
      return NextResponse.json(
        { error: "GitHub ID is required" },
        { status: 400 }
      )
    }

    // Update the repository directly
    const updatedRepo = await prisma.repository.update({
      where: { githubId: BigInt(githubId) },
      data: {
        name: name || undefined,
        description: description || undefined,
        updatedAt: new Date()
      }
    })

    devLog("Repository updated successfully:", updatedRepo)

    return NextResponse.json({
      success: true,
      message: "Repository updated successfully",
      repository: {
        id: updatedRepo.id,
        githubId: updatedRepo.githubId.toString(),
        name: updatedRepo.name,
        description: updatedRepo.description
      }
    })

  } catch (error) {
    console.error("Error updating repository:", error)
    return NextResponse.json(
      { error: "Failed to update repository" },
      { status: 500 }
    )
  }
}
