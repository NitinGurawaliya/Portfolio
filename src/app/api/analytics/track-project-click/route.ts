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
      
      if (portfolioRepo) {
        whereClause.projectId = BigInt(portfolioRepo.id)
      }
    }

    const dailyViews = await prisma.dailyProjectViews.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      }
    })

    console.log('📊 API: Found daily views:', dailyViews.length)
    console.log('📊 API: Where clause:', whereClause)
    console.log('📊 API: Daily views data:', dailyViews)

    // Group by date and project
    const viewsByDate: { [key: string]: { [key: string]: number } } = {}
    
    dailyViews.forEach(view => {
      const dateKey = view.date.toISOString().split('T')[0]
      if (!viewsByDate[dateKey]) {
        viewsByDate[dateKey] = {}
      }
      viewsByDate[dateKey][view.projectName] = view.views
    })

    console.log('📊 API: Views by date:', viewsByDate)

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

    console.log('📊 API: Chart data created:', chartData)
    console.log('📊 API: Total views:', dailyViews.reduce((sum, view) => sum + view.views, 0))

    return NextResponse.json({ 
      success: true, 
      data: chartData,
      totalViews: dailyViews.reduce((sum, view) => sum + view.views, 0)
    })
  } catch (error) {
    console.error('Error fetching project views:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
