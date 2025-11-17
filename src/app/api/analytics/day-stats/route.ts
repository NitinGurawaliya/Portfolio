import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const portfolioId = searchParams.get("portfolioId")
    const date = searchParams.get("date")
    
    if (!portfolioId || !date) {
      return NextResponse.json(
        { error: "Missing portfolioId or date" },
        { status: 400 }
      )
    }
    
    console.log(`📊 Day Analytics: Fetching data for portfolio ${portfolioId} on ${date}`)
    
    // Start and end of the day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Get all views for this specific day
    const views = await prisma.portfolioView.findMany({
      where: {
        portfolioId: parseInt(portfolioId),
        viewedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        referrer: true,
        device: true,
        browser: true,
        ipAddress: true
      }
    })
    
    console.log(`📊 Found ${views.length} views on ${date}`)
    
    // Count referrers
    const referrerCounts: Record<string, number> = {}
    views.forEach(view => {
      const ref = view.referrer || 'Direct'
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1
    })
    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Count devices
    const deviceCounts: Record<string, number> = {}
    views.forEach(view => {
      const device = view.device || 'Unknown'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    })
    const topDevices = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
    
    // Count browsers
    const browserCounts: Record<string, number> = {}
    views.forEach(view => {
      const browser = view.browser || 'Unknown'
      browserCounts[browser] = (browserCounts[browser] || 0) + 1
    })
    const topBrowsers = Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
    
    return NextResponse.json({
      totalViews: views.length,
      topReferrers,
      topDevices,
      topBrowsers
    })
    
  } catch (error) {
    console.error("❌ Day Analytics: Error fetching day stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch day analytics" },
      { status: 500 }
    )
  }
}

