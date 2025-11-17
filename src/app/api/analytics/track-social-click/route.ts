import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { portfolioId, socialType, socialUrl } = await req.json()
    
    if (!portfolioId || !socialType || !socialUrl) {
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
    
    console.log(`📊 Analytics: Tracking social click for portfolio ${portfolioId}, ${socialType}`)
    
    // Create social click record
    await prisma.socialClick.create({
      data: {
        portfolioId,
        socialType,
        socialUrl,
        ipAddress,
        userAgent,
        referrer
      }
    })
    
    console.log(`✅ Analytics: Social click recorded for ${socialType}`)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("❌ Analytics: Error tracking social click:", error)
    return NextResponse.json(
      { error: "Failed to track social click" },
      { status: 500 }
    )
  }
}
