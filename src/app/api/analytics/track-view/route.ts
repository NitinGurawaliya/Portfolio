import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { portfolioId, userId } = await req.json()
    
    if (!portfolioId || !userId) {
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
    
    console.log(`📊 Analytics: Tracking view for portfolio ${portfolioId} by user ${userId}`)
    
    // Create view record
    await prisma.portfolioView.create({
      data: {
        portfolioId,
        userId,
        ipAddress,
        userAgent,
        referrer
      }
    })
    
    console.log(`✅ Analytics: View recorded for portfolio ${portfolioId}`)
    
    // Update analytics summary
    const analyticsResult = await prisma.portfolioAnalytics.upsert({
      where: { portfolioId },
      create: {
        portfolioId,
        totalViews: 1,
        lastViewedAt: new Date()
      },
      update: {
        totalViews: { increment: 1 },
        lastViewedAt: new Date()
      }
    })
    
    console.log(`📈 Analytics: Updated view count for portfolio ${portfolioId} - Total views: ${analyticsResult.totalViews}`)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("❌ Analytics: Error tracking view:", error)
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    )
  }
}
