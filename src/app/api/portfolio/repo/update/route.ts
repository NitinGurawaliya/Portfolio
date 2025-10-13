import { NextRequest, NextResponse } from "next/server"
import { devLog } from "@/lib/logger"
import { withErrorHandling } from "@/lib/middleware"
import { validateRequest } from "@/lib/middleware"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const repoUpdateSchema = z.object({ githubId: z.union([z.number(), z.string()]), name: z.string().optional(), description: z.string().optional() })

export const POST = withErrorHandling(
  validateRequest(repoUpdateSchema)(async (req: NextRequest, ctx) => {
    const { githubId, name, description } = ctx.data

    devLog("Updating repository:", { githubId, name, description })

    if (!githubId) return NextResponse.json({ error: "GitHub ID is required" }, { status: 400 })

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
  })
)
