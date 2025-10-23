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
    
    // Generate daily data for the last 1 year (365 days) with generous advance
    const dailyData = []
    
    // Use a generous advance to handle all timezone edge cases
    const now = new Date()
    const advanceDays = parseInt(process.env.ANALYTICS_ADVANCE_DAYS || '7') // Configurable advance days
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
    
    return NextResponse.json({
      totalViews: analytics?.totalViews || 0,
      lastViewedAt: analytics?.lastViewedAt,
      dailyData
    })
    
  } catch (error) {
    console.error("❌ Analytics: Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
