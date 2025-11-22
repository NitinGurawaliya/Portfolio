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
    
    // Try to find portfolio repository - projectId should be PortfolioRepository ID
    let portfolioRepo = await prisma.portfolioRepository.findFirst({
      where: {
        id: parseInt(projectId),
        portfolioId: parseInt(portfolioId),
        deletedAt: null // Only use non-deleted projects
      },
      select: {
        id: true,
        customName: true,
        repository: {
          select: {
            name: true
          }
        }
      }
    })
    
    // If not found by direct ID, try by GitHub ID (fallback for old tracking)
    if (!portfolioRepo) {
      portfolioRepo = await prisma.portfolioRepository.findFirst({
        where: {
          portfolioId: parseInt(portfolioId),
          repository: {
            githubId: BigInt(projectId)
          },
          deletedAt: null
        },
        select: {
          id: true,
          customName: true,
          repository: {
            select: {
              name: true
            }
          }
        }
      })
      
      if (portfolioRepo) {
        console.log(`⚠️ Using fallback: Found portfolio repository ${portfolioRepo.id} for GitHub ID ${projectId}`)
      }
    }
    
    if (!portfolioRepo) {
      console.log(`❌ No valid portfolio repository found for projectId ${projectId} in portfolio ${portfolioId}`)
      return NextResponse.json(
        { error: "Project not found in portfolio or has been removed" },
        { status: 404 }
      )
    }
    
    console.log(`✅ Using portfolio repository ID ${portfolioRepo.id}`)
    
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

    // Also update daily project views for chart data
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyProjectViews.upsert({
      where: {
        portfolioId_projectId_date: {
          portfolioId: parseInt(portfolioId),
          projectId: BigInt(portfolioRepo.id),
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
        portfolioId: parseInt(portfolioId),
        projectId: BigInt(portfolioRepo.id),
        projectName,
        date: today,
        views: 1
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')
    const projectId = searchParams.get('projectId')
    const daysParam = searchParams.get('days')
    const getAllData = daysParam === 'all'

    console.log('🚀 API GET: Starting request', { portfolioId, projectId, days: daysParam, getAllData })

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 })
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

    let whereClause: any = {
      portfolioId: parseInt(portfolioId),
      date: {
        gte: startDate
      }
    }

    // Get current project name for matching - needed for data extraction
    let currentProjectName: string | null = null

    if (projectId) {
      try {
        console.log('🔍 API: Looking for projectId:', projectId, 'type:', typeof projectId)
        
        // Try to use projectId directly as PortfolioRepository ID first
        const portfolioRepo = await prisma.portfolioRepository.findFirst({
          where: {
            id: parseInt(projectId),
            portfolioId: parseInt(portfolioId),
            deletedAt: null // Only include non-deleted projects
          },
          select: { id: true }
        })
        
        console.log('🔍 API: Found portfolio repository with ID:', portfolioRepo?.id)
        
        if (portfolioRepo) {
          whereClause.projectId = BigInt(portfolioRepo.id)
          console.log('🔍 API: Using projectId in whereClause:', whereClause.projectId.toString())
        } else {
          console.log('⚠️ API: No portfolio repository found for projectId:', projectId, 'in portfolio:', portfolioId)
          // Don't continue with invalid IDs - this prevents orphaned data
          return NextResponse.json({
            success: true,
            data: [],
            totalViews: 0
          })
        }
      } catch (error) {
        console.error('❌ Error finding portfolio repository:', error)
        // Return empty data instead of continuing with invalid IDs
        return NextResponse.json({
          success: true,
          data: [],
          totalViews: 0
        })
      }
    }

    // Serialize whereClause for logging (handle BigInt)
    const whereClauseLog = { ...whereClause }
    if (whereClauseLog.projectId) {
      whereClauseLog.projectId = whereClauseLog.projectId.toString()
    }
    console.log('📊 API GET: Final whereClause before query:', JSON.stringify(whereClauseLog, null, 2))

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
          portfolioId: parseInt(portfolioId),
          deletedAt: null
        },
        select: { id: true }
      })
      validProjects.forEach(p => validProjectIds.add(p.id))
    }

    const filteredViews = dailyViews.filter(view => 
      !portfolioId || !projectId || validProjectIds.has(Number(view.projectId))
    )

    console.log('📊 API GET: Found daily views:', filteredViews.length, '(filtered from', dailyViews.length, 'total)')
    
    // Convert BigInt to string for logging
    const dailyViewsLog = dailyViews.map(view => ({
      ...view,
      projectId: view.projectId.toString()
    }))
    console.log('📊 API GET: Daily views data:', JSON.stringify(dailyViewsLog, null, 2))

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

    let chartData: any[] = []

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
        
        const monthData: any = {
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
        
        const dayData: any = {
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
    const responseData: any = {
      success: true, 
      data: chartData,
      totalViews,
      validProjectsCount: validProjectIds.size
    }
    
    if (primaryProjectName) {
      responseData.projectName = primaryProjectName
    }
    
    console.log('✅ API GET: Returning response with', chartData.length, 'data points,', totalViews, 'total views')
    console.log('✅ API GET: Primary project name:', primaryProjectName)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('❌ API GET: Error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
