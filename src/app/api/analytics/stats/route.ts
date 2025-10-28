import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const portfolioId = searchParams.get("portfolioId")
    
    if (!portfolioId) {
      return NextResponse.json(
        { error: "Missing portfolioId" },
        { status: 400 }
      )
    }
    
    console.log(`📊 Analytics: Fetching analytics data for portfolio ${portfolioId}`)
    
    // Get analytics summary
    const analytics = await prisma.portfolioAnalytics.findUnique({
      where: { portfolioId: parseInt(portfolioId) }
    })
    
    console.log(`📈 Analytics: Found ${analytics?.totalViews || 0} total views for portfolio ${portfolioId}`)
    
    // Get views in the last 1 year (365 days for heatmap)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 365)
    
    const views = await prisma.portfolioView.findMany({
      where: {
        portfolioId: parseInt(portfolioId),
        viewedAt: {
          gte: startDate
        }
      },
      select: {
        viewedAt: true
      },
      orderBy: {
        viewedAt: 'asc'
      }
    })
    
    console.log(`📊 Analytics: Found ${views.length} views in last 1 year for portfolio ${portfolioId}`)
    
    // Group views by date
    const viewsByDate: Record<string, number> = {}
    views.forEach(view => {
      const date = view.viewedAt.toISOString().split('T')[0]
      viewsByDate[date] = (viewsByDate[date] || 0) + 1
    })
    
    // Generate daily data for the last 1 year (365 days) with advance days
    const dailyData = []
    
    // Use advance days to handle timezone edge cases and ensure proper heatmap display
    const now = new Date()
    const advanceDays = 7 // 7 days advance for proper heatmap generation
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + advanceDays)
    const endDateStr = endDate.toISOString().split('T')[0]
    
    console.log(`📅 Generating data for 365 days ending on ${endDateStr} (${advanceDays} days advance)`)
    console.log(`📅 Current server time: ${now.toISOString()}`)
    
    // Generate 365 days of data (including advance days in future)
    for (let i = 364; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i + advanceDays) // Add advance days
      const dateStr = date.toISOString().split('T')[0]
      dailyData.push({
        date: dateStr,
        count: viewsByDate[dateStr] || 0
      })
    }
    
    console.log(`📊 Generated ${dailyData.length} days of data`)
    console.log(`📅 First day: ${dailyData[0]?.date}`)
    console.log(`📅 Last day: ${dailyData[dailyData.length - 1]?.date}`)
    
    const activeDays = dailyData.filter(d => d.count > 0).length
    console.log(`✅ Analytics: Generated heatmap data for portfolio ${portfolioId} - ${activeDays} active days`)
    
    // Get additional analytics data
    const allViews = await prisma.portfolioView.findMany({
      where: { portfolioId: parseInt(portfolioId) },
      select: {
        referrer: true,
        device: true,
        browser: true,
        ipAddress: true
      }
    })
    
    // Count unique visitors (by IP)
    const uniqueIPs = new Set(allViews.map(v => v.ipAddress).filter(Boolean))
    
    // Top referrers
    const referrerCounts: Record<string, number> = {}
    allViews.forEach(view => {
      const ref = view.referrer || 'Direct'
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1
    })
    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    // Top devices
    const deviceCounts: Record<string, number> = {}
    allViews.forEach(view => {
      const device = view.device || 'Unknown'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    })
    const topDevices = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
    
    // Top browsers
    const browserCounts: Record<string, number> = {}
    allViews.forEach(view => {
      const browser = view.browser || 'Unknown'
      browserCounts[browser] = (browserCounts[browser] || 0) + 1
    })
    const topBrowsers = Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
    
    return NextResponse.json({
      totalViews: analytics?.totalViews || 0,
      lastViewedAt: analytics?.lastViewedAt,
      dailyData,
      uniqueVisitors: uniqueIPs.size,
      topReferrers,
      topDevices,
      topBrowsers
    })
    
  } catch (error) {
    console.error("❌ Analytics: Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
