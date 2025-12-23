import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolvePortfolioRepositoryId } from "@/lib/analytics/project-id"

export async function POST(req: NextRequest) {
  try {
    const { portfolioId, projectId, projectName } = await req.json()
    
    if (!portfolioId || !projectId || !projectName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const portfolioIdNum = Number.parseInt(String(portfolioId), 10)
    if (!Number.isFinite(portfolioIdNum)) {
      return NextResponse.json({ error: "Invalid portfolioId" }, { status: 400 })
    }
    
    // Get client info
    const ipAddress = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"
    const referrer = req.headers.get("referer") || "direct"
    
    const resolved = await resolvePortfolioRepositoryId({
      portfolioId: portfolioIdNum,
      projectId,
    })

    if (resolved.kind === "imported") {
      // Imported project IDs are not persisted yet -> ignore tracking.
      return NextResponse.json({ success: true })
    }

    if (resolved.kind !== "ok") {
      return NextResponse.json(
        { error: "Project not found in portfolio or has been removed" },
        { status: 404 }
      )
    }
    
    // Create project click record with portfolio repository ID
    await prisma.projectClick.create({
      data: {
        portfolioId: portfolioIdNum,
        projectId: resolved.portfolioRepositoryId, // Use portfolio repository ID
        projectName,
        ipAddress,
        userAgent,
        referrer
      }
    })

    // Also update daily project views for chart data
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyProjectViews.upsert({
      where: {
        portfolioId_projectId_date: {
          portfolioId: portfolioIdNum,
          projectId: BigInt(resolved.portfolioRepositoryId),
          date: today
        }
      },
      update: {
        views: {
          increment: 1
        },
        updatedAt: new Date()
      },
      create: {
        portfolioId: portfolioIdNum,
        projectId: BigInt(resolved.portfolioRepositoryId),
        projectName,
        date: today,
        views: 1
      }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("❌ Analytics: Error tracking project click:", error)
    return NextResponse.json(
      { error: "Failed to track project click" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')
    const projectId = searchParams.get('projectId')
    const daysParam = searchParams.get('days')
    const getAllData = daysParam === 'all'

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 })
    }

    const portfolioIdNum = Number.parseInt(portfolioId, 10)
    if (!Number.isFinite(portfolioIdNum)) {
      return NextResponse.json({ error: "Invalid portfolioId" }, { status: 400 })
    }

    let startDate: Date
    let shouldSummarizeByMonth = false
    if (getAllData) {
      // For 'all', get last 12 months for year view
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 12)
      startDate.setDate(1) // Start from first day of that month
      startDate.setHours(0, 0, 0, 0)
      shouldSummarizeByMonth = true
    } else {
      const days = parseInt(daysParam || '7')
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)
      shouldSummarizeByMonth = false
    }

    type DailyViewsWhere = {
      portfolioId: number
      date: { gte: Date }
      projectId?: bigint
    }

    const whereClause: DailyViewsWhere = {
      portfolioId: portfolioIdNum,
      date: {
        gte: startDate
      }
    }

    // Get current project name for matching - needed for data extraction
    let currentProjectName: string | null = null

    if (projectId) {
      const resolved = await resolvePortfolioRepositoryId({
        portfolioId: portfolioIdNum,
        projectId,
      })

      if (resolved.kind === "imported") {
        return NextResponse.json({
          success: true,
          data: [],
          totalViews: 0,
          message: resolved.message,
        })
      }

      if (resolved.kind !== "ok") {
        return NextResponse.json({
          success: true,
          data: [],
          totalViews: 0,
        })
      }

      whereClause.projectId = BigInt(resolved.portfolioRepositoryId)

      // Best-effort: fetch current project name for stable chart key
      const pr = await prisma.portfolioRepository.findUnique({
        where: { id: resolved.portfolioRepositoryId },
        select: {
          customName: true,
          repository: { select: { name: true } },
        },
      })
      currentProjectName = pr?.customName || pr?.repository?.name || null
    }

    // Filter out views for deleted projects
    const dailyViews = await prisma.dailyProjectViews.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      }
    })

    // Only return views for projects that still exist and aren't deleted
    const validProjectIds = new Set<number>()
    if (portfolioId) {
      const validProjects = await prisma.portfolioRepository.findMany({
        where: {
          portfolioId: portfolioIdNum,
          deletedAt: null
        },
        select: { id: true }
      })
      validProjects.forEach(p => validProjectIds.add(p.id))
    }

    const filteredViews = dailyViews.filter(view => 
      !portfolioId || !projectId || validProjectIds.has(Number(view.projectId))
    )

    // Group by date and project
    const viewsByDate: { [key: string]: { [key: string]: number } } = {}
    
    filteredViews.forEach(view => {
      const dateKey = view.date.toISOString().split('T')[0]
      if (!viewsByDate[dateKey]) {
        viewsByDate[dateKey] = {}
      }
      viewsByDate[dateKey][view.projectName] = view.views
    })

    // Get all unique project names from data
    const projectNames = new Set<string>()
    filteredViews.forEach(view => {
      projectNames.add(view.projectName)
    })

    // Use the first name as the primary key (current or most recent)
    // If we have currentProjectName, use it; otherwise use the first name from data
    const primaryProjectName = currentProjectName || Array.from(projectNames)[0] || ''

    type ChartPoint = Record<string, string | number>
    const chartData: ChartPoint[] = []

    if (shouldSummarizeByMonth) {
      // Summarize by month, skip months with no views
      const viewsByMonth: { [key: string]: { [key: string]: number } } = {}
      
      filteredViews.forEach(view => {
        const date = new Date(view.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!viewsByMonth[monthKey]) {
          viewsByMonth[monthKey] = {}
        }
        
        // Aggregate all project names (in case name changed over time)
        const viewProjectName = view.projectName
        if (!viewsByMonth[monthKey][viewProjectName]) {
          viewsByMonth[monthKey][viewProjectName] = 0
        }
        viewsByMonth[monthKey][viewProjectName] += view.views
        
        // Also add to primary name if different (for name changes)
        // This ensures data is accessible by current project name even if it changed
        if (primaryProjectName && viewProjectName !== primaryProjectName) {
          if (!viewsByMonth[monthKey][primaryProjectName]) {
            viewsByMonth[monthKey][primaryProjectName] = 0
          }
          viewsByMonth[monthKey][primaryProjectName] += view.views
        }
      })

      // Convert to chart data, only include months with views
      const sortedMonths = Object.keys(viewsByMonth).sort()
      
      sortedMonths.forEach(monthKey => {
        const [year, month] = monthKey.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        
        const monthData: ChartPoint = {
          date: monthKey,
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          monthShort: date.toLocaleDateString('en-US', { month: 'short' })
        }

        // Use primary project name for consistent data access
        if (primaryProjectName) {
          monthData[primaryProjectName] = viewsByMonth[monthKey]?.[primaryProjectName] || 0
        }

        // Only add if there are views
        const hasViews = primaryProjectName && (viewsByMonth[monthKey]?.[primaryProjectName] || 0) > 0
        if (hasViews) {
          chartData.push(monthData)
        }
      })
    } else {
      // Original daily data logic
      const days = parseInt(daysParam || '7')
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        const dateKey = date.toISOString().split('T')[0]
        
        const dayData: ChartPoint = {
          date: dateKey,
          day: date.toLocaleDateString('en-US', { weekday: 'short' })
        }

        // Use primary project name for consistent data access
        if (primaryProjectName) {
          dayData[primaryProjectName] = viewsByDate[dateKey]?.[primaryProjectName] || 0
        }

        chartData.push(dayData)
      }
    }
    
    const totalViews = filteredViews.reduce((sum, view) => sum + view.views, 0)
    
    // Add metadata about which project name to use
    const responseData: {
      success: true
      data: ChartPoint[]
      totalViews: number
      validProjectsCount: number
      projectName?: string
    } = {
      success: true, 
      data: chartData,
      totalViews,
      validProjectsCount: validProjectIds.size
    }
    
    if (primaryProjectName) {
      responseData.projectName = primaryProjectName
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('❌ API GET: Error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
