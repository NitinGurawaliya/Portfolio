import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { detectDevice, detectBrowser, normalizeReferrer, detectSocialSource } from "@/lib/device-detector"
import { analyticsEvents } from "@/lib/analytics-events"

export async function POST(req: NextRequest) {
  try {
    const { portfolioId, userId, testReferrer, clientReferrer } = await req.json()
    
    if (!portfolioId) {
      return NextResponse.json(
        { error: "Missing portfolioId" },
        { status: 400 }
      )
    }
    
    // Get client info
    const ipAddress = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"
    
    // Priority: testReferrer > clientReferrer > server header referrer
    // Client-side capture is most reliable for social platforms
    const rawReferrer = testReferrer || clientReferrer || req.headers.get("referer") || "direct"
    
    // Debug: Log for production debugging
    console.log('🔍 Production Referrer Debug:', {
      rawReferrer,
      testReferrer,
      clientReferrer,
      serverRefererHeader: req.headers.get("referer"),
      userAgent: userAgent.substring(0, 50),
      allHeaders: {
        origin: req.headers.get("origin"),
        referer: req.headers.get("referer"),
        referrer: req.headers.get("referrer"),
      }
    })
    
    // Check for social media crawlers and bots that might indicate social traffic
    const isSocialTraffic = detectSocialSource(userAgent, rawReferrer)
    
    // Normalize referrer to show actual platform
    const referrer = normalizeReferrer(rawReferrer, isSocialTraffic)
    
    console.log('🔍 Production Final:', { rawReferrer, referrer, socialSource: isSocialTraffic })
    
    // Detect device and browser (pass headers for accurate detection)
    const device = detectDevice(userAgent)
    const browser = detectBrowser(userAgent, req.headers)
    
    console.log(`📊 Analytics: Tracking view for portfolio ${portfolioId}${userId ? ` by user ${userId}` : ' (anonymous)'}`)
    
    // Create view record
    await prisma.portfolioView.create({
      data: {
        portfolioId,
        userId: userId || 0, // Use 0 for anonymous users
        ipAddress,
        userAgent,
        referrer,
        device,
        browser
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
    
    // Emit real-time event for dashboard updates
    analyticsEvents.emit(portfolioId, 'view', {
      totalViews: analyticsResult.totalViews,
      referrer,
      device,
      browser,
      timestamp: new Date()
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("❌ Analytics: Error tracking view:", error)
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    )
  }
}
