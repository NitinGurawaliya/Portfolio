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
    const days = parseInt(searchParams.get('days') || '7')

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    let whereClause: any = {
      portfolioId: parseInt(portfolioId),
      date: {
        gte: startDate
      }
    }

    if (projectId) {
      try {
        console.log('🔍 API: Looking for projectId:', projectId, 'type:', typeof projectId)
        
        // Try to find the portfolio repository ID first
        const portfolioRepo = await prisma.portfolioRepository.findFirst({
          where: {
            portfolioId: parseInt(portfolioId),
            OR: [
              { repository: { githubId: BigInt(projectId) } },
              { repositoryId: parseInt(projectId) }
            ]
          },
          select: { id: true }
        })
        
        console.log('🔍 API: Found portfolio repository:', portfolioRepo)
        
        if (portfolioRepo) {
          whereClause.projectId = BigInt(portfolioRepo.id)
          console.log('🔍 API: Using projectId in whereClause:', whereClause.projectId)
        } else {
          console.log('⚠️ API: No portfolio repository found for projectId:', projectId)
        }
      } catch (error) {
        console.error('❌ Error finding portfolio repository:', error)
        // Continue without projectId filter
      }
    }

    console.log('📊 API GET: Final whereClause before query:', JSON.stringify(whereClause, null, 2))

    const dailyViews = await prisma.dailyProjectViews.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      }
    })

    console.log('📊 API GET: Found daily views:', dailyViews.length)
    console.log('📊 API GET: Where clause:', JSON.stringify(whereClause, null, 2))
    console.log('📊 API GET: Daily views data:', JSON.stringify(dailyViews, null, 2))

    // Group by date and project
    const viewsByDate: { [key: string]: { [key: string]: number } } = {}
    
    dailyViews.forEach(view => {
      const dateKey = view.date.toISOString().split('T')[0]
      if (!viewsByDate[dateKey]) {
        viewsByDate[dateKey] = {}
      }
      viewsByDate[dateKey][view.projectName] = view.views
    })

    console.log('📊 API GET: Views by date:', JSON.stringify(viewsByDate, null, 2))

    // Create chart data
    const chartData = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const dateKey = date.toISOString().split('T')[0]
      
      const dayData: any = {
        date: dateKey,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      }

      // Get all unique project names
      const projectNames = new Set<string>()
      dailyViews.forEach(view => {
        projectNames.add(view.projectName)
      })

      console.log('📊 API GET: Unique project names:', Array.from(projectNames))

      // Add views for each project
      projectNames.forEach(projectName => {
        dayData[projectName] = viewsByDate[dateKey]?.[projectName] || 0
      })

      chartData.push(dayData)
    }

    console.log('📊 API GET: Chart data created:', JSON.stringify(chartData, null, 2))
    console.log('📊 API GET: Total views:', dailyViews.reduce((sum, view) => sum + view.views, 0))

    const response = {
      success: true, 
      data: chartData,
      totalViews: dailyViews.reduce((sum, view) => sum + view.views, 0)
    }

    console.log('✅ API GET: Returning successful response:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ API GET: Error fetching project views:', error)
    console.error('❌ API GET: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
