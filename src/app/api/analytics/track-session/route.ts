import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { portfolioId, sessionId, action, timeSpent } = await req.json()
    
    if (!portfolioId || !sessionId || !action) {
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
    
    console.log(`📊 Analytics: Tracking session ${action} for portfolio ${portfolioId}`)
    
    if (action === 'start') {
      // Create or update session start
      await prisma.portfolioSession.upsert({
        where: { sessionId },
        create: {
          portfolioId,
          sessionId,
          ipAddress,
          userAgent,
          referrer
        },
        update: {
          startTime: new Date(),
          ipAddress,
          userAgent,
          referrer
        }
      })
    } else if (action === 'end') {
      // Update session end
      await prisma.portfolioSession.updateMany({
        where: { 
          sessionId,
          portfolioId 
        },
        data: {
          endTime: new Date(),
          timeSpent: timeSpent || null
        }
      })
    }
    
    console.log(`✅ Analytics: Session ${action} recorded`)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("❌ Analytics: Error tracking session:", error)
    return NextResponse.json(
      { error: "Failed to track session" },
      { status: 500 }
    )
  }
}
