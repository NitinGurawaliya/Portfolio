import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { portfolioId, projectId, projectName } = await req.json()
    
    if (!portfolioId || !projectId || !projectName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Get client info
    const ipAddress = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"
    const referrer = req.headers.get("referer") || "direct"
    
    console.log(`📊 Analytics: Tracking project click for portfolio ${portfolioId}, project ${projectName}`)
    console.log(`🔍 DEBUG: Received data:`, { portfolioId, projectId, projectName })
    console.log(`🔍 DEBUG: Data types:`, { 
      portfolioIdType: typeof portfolioId, 
      projectIdType: typeof projectId, 
      projectNameType: typeof projectName 
    })
    
    // Try to find portfolio repository by GitHub ID first, then by database ID
    let portfolioRepo = await prisma.portfolioRepository.findFirst({
      where: {
        portfolioId: parseInt(portfolioId),
        repository: {
          githubId: BigInt(projectId)
        }
      },
      select: {
        id: true,
        repository: {
          select: {
            name: true
          }
        }
      }
    })
    
    // If not found by GitHub ID, try by database repository ID
    if (!portfolioRepo) {
      portfolioRepo = await prisma.portfolioRepository.findFirst({
        where: {
          portfolioId: parseInt(portfolioId),
          repositoryId: parseInt(projectId)
        },
        select: {
          id: true,
          repository: {
            select: {
              name: true
            }
          }
        }
      })
    }
    
    if (!portfolioRepo) {
      console.log(`🔍 DEBUG: No portfolio repository found for ID ${projectId} (tried both GitHub ID and database ID)`)
      return NextResponse.json(
        { error: "Project not found in portfolio" },
        { status: 404 }
      )
    }
    
    console.log(`🔍 DEBUG: Found portfolio repository ID ${portfolioRepo.id} for GitHub ID ${projectId}`)
    
    // Create project click record with portfolio repository ID
    await prisma.projectClick.create({
      data: {
        portfolioId,
        projectId: portfolioRepo.id, // Use portfolio repository ID
        projectName,
        ipAddress,
        userAgent,
        referrer
      }
    })
    
    console.log(`✅ Analytics: Project click recorded for ${projectName}`)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("❌ Analytics: Error tracking project click:", error)
    return NextResponse.json(
      { error: "Failed to track project click" },
      { status: 500 }
    )
  }
}
