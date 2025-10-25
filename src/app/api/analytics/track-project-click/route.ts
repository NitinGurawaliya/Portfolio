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

    console.log('🚀 API GET: Starting request', { portfolioId, projectId, days })

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
        console.log('🔍 API: Looking for projectId (GitHub ID):', projectId, 'type:', typeof projectId)
        
        // Find repository by GitHub ID
        const repository = await prisma.repository.findFirst({
          where: {
            githubId: BigInt(projectId)
          },
          select: { id: true }
        })
        
        console.log('🔍 API: Found repository with ID:', repository?.id)
        
        if (repository) {
          // Find portfolio repository using repositoryId
          const portfolioRepo = await prisma.portfolioRepository.findFirst({
            where: {
              portfolioId: parseInt(portfolioId),
              repositoryId: repository.id
            },
            select: { id: true }
          })
          
          console.log('🔍 API: Found portfolio repository with ID:', portfolioRepo?.id)
          
          if (portfolioRepo) {
            whereClause.projectId = BigInt(portfolioRepo.id)
            console.log('🔍 API: Using projectId in whereClause:', whereClause.projectId.toString())
          } else {
            console.log('⚠️ API: No portfolio repository found for GitHub ID:', projectId)
          }
        } else {
          console.log('⚠️ API: No repository found for GitHub ID:', projectId)
        }
      } catch (error) {
        console.error('❌ Error finding portfolio repository:', error)
        // Continue without projectId filter
      }
    }

    // Serialize whereClause for logging (handle BigInt)
    const whereClauseLog = { ...whereClause }
    if (whereClauseLog.projectId) {
      whereClauseLog.projectId = whereClauseLog.projectId.toString()
    }
    console.log('📊 API GET: Final whereClause before query:', JSON.stringify(whereClauseLog, null, 2))

    const dailyViews = await prisma.dailyProjectViews.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      }
    })

    console.log('📊 API GET: Found daily views:', dailyViews.length)
    
    // Convert BigInt to string for logging
    const dailyViewsLog = dailyViews.map(view => ({
      ...view,
      projectId: view.projectId.toString()
    }))
    console.log('📊 API GET: Daily views data:', JSON.stringify(dailyViewsLog, null, 2))

    // Group by date and project
    const viewsByDate: { [key: string]: { [key: string]: number } } = {}
    
    dailyViews.forEach(view => {
      const dateKey = view.date.toISOString().split('T')[0]
      if (!viewsByDate[dateKey]) {
        viewsByDate[dateKey] = {}
      }
      viewsByDate[dateKey][view.projectName] = view.views
    })

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

      // Add views for each project
      projectNames.forEach(projectName => {
        dayData[projectName] = viewsByDate[dateKey]?.[projectName] || 0
      })

      chartData.push(dayData)
    }

    const totalViews = dailyViews.reduce((sum, view) => sum + view.views, 0)
    
    console.log('✅ API GET: Returning response with', chartData.length, 'days,', totalViews, 'total views')

    return NextResponse.json({
      success: true, 
      data: chartData,
      totalViews
    })
  } catch (error) {
    console.error('❌ API GET: Error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
