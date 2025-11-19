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
    
    console.log(`📊 Analytics: Fetching detailed analytics for portfolio ${portfolioId}`)
    
    // Get project clicks with repository information
    const projectClicks = await prisma.projectClick.findMany({
      where: { portfolioId: parseInt(portfolioId) },
      select: {
        projectId: true,
        projectName: true,
        clickedAt: true
      },
      orderBy: { clickedAt: 'desc' }
    })
    
    console.log(`🔍 DEBUG: Found ${projectClicks.length} project clicks for portfolio ${portfolioId}`)
    console.log(`🔍 DEBUG: Raw project clicks:`, projectClicks)
    
    // Get portfolio repositories to map projectId to repositoryId
    const portfolioRepos = await prisma.portfolioRepository.findMany({
      where: { portfolioId: parseInt(portfolioId) },
      select: {
        id: true,
        repositoryId: true,
        repository: {
          select: {
            id: true,
            githubId: true,
            name: true
          }
        }
      }
    })
    
    console.log(`🔍 DEBUG: Portfolio repositories:`, portfolioRepos)
    
    // Create mapping from portfolio repository ID to GitHub repository ID
    const projectIdToRepoId = portfolioRepos.reduce((acc, repo) => {
      acc[repo.id] = {
        portfolioRepoId: repo.id, // Include PortfolioRepository ID
        repositoryId: repo.repositoryId,
        githubId: Number(repo.repository.githubId),
        name: repo.repository.name
      }
      return acc
    }, {} as Record<number, any>)
    
    // Also create mapping from database repository ID to GitHub repository ID
    const dbRepoIdToRepoId = portfolioRepos.reduce((acc, repo) => {
      acc[repo.repositoryId] = {
        repositoryId: repo.repositoryId,
        githubId: Number(repo.repository.githubId),
        name: repo.repository.name
      }
      return acc
    }, {} as Record<number, any>)
    
    console.log(`🔍 DEBUG: Project ID to Repo ID mapping:`, projectIdToRepoId)
    console.log(`🔍 DEBUG: DB Repo ID to Repo ID mapping:`, dbRepoIdToRepoId)

    // Fetch upvote counts for all portfolio repositories
    const portfolioRepoIds = portfolioRepos.map((repo) => repo.id)
    const upvoteCountMap = new Map<number, number>()
    if (portfolioRepoIds.length > 0) {
      const upvoteRows = await prisma.projectUpvote.findMany({
        where: {
          portfolioRepositoryId: { in: portfolioRepoIds },
        },
        select: {
          portfolioRepositoryId: true,
        },
      })

      for (const { portfolioRepositoryId } of upvoteRows) {
        const current = upvoteCountMap.get(portfolioRepositoryId) ?? 0
        upvoteCountMap.set(portfolioRepositoryId, current + 1)
      }
    }
    
    // Group project clicks by repository ID (GitHub ID)
    const projectStats = projectClicks.reduce((acc, click) => {
      // Try to find by portfolio repository ID first
      let repoInfo = projectIdToRepoId[Number(click.projectId)]
      
      // If not found, try by database repository ID
      if (!repoInfo) {
        repoInfo = dbRepoIdToRepoId[Number(click.projectId)]
      }
      
      if (!repoInfo) {
        console.log(`🔍 DEBUG: No repository found for project ID ${click.projectId}`)
        return acc
      }
      
      // Use PortfolioRepository ID as the key for consistent matching
      const portfolioRepoId = repoInfo.portfolioRepoId || Number(click.projectId)
      const key = portfolioRepoId.toString()
      console.log(`🔍 DEBUG: Processing click for project ${click.projectId} -> PortfolioRepository ID ${portfolioRepoId} (${click.projectName})`)
      
      if (!acc[key]) {
        acc[key] = {
          projectId: portfolioRepoId, // Use PortfolioRepository ID for frontend matching
          portfolioProjectId: Number(click.projectId), // Original portfolio repository ID from clicks table
          githubId: repoInfo.githubId, // Also include GitHub ID for reference
          projectName: click.projectName,
          clickCount: 0,
          totalViews: 0, // Will be populated later from DailyProjectViews
          lastClicked: click.clickedAt.toISOString() // Convert Date to string
        }
        console.log(`🔍 DEBUG: Created new entry for PortfolioRepository ${portfolioRepoId}`)
      }
      acc[key].clickCount++
      console.log(`🔍 DEBUG: Incremented count for PortfolioRepository ${portfolioRepoId}, new count: ${acc[key].clickCount}`)
      return acc
    }, {} as Record<string, any>)
    
    console.log(`🔍 DEBUG: Final project stats:`, projectStats)
    console.log(`🔍 DEBUG: Project stats keys:`, Object.keys(projectStats))
    console.log(`🔍 DEBUG: Project stats values:`, Object.values(projectStats))

    // Fetch total views from DailyProjectViews for all portfolio repositories
    const portfolioRepoIdsBigInt = portfolioRepos.map((repo) => BigInt(repo.id))
    const dailyViews = await prisma.dailyProjectViews.groupBy({
      by: ["projectId"],
      where: {
        portfolioId: parseInt(portfolioId),
        projectId: { in: portfolioRepoIdsBigInt },
      },
      _sum: {
        views: true,
      },
    })

    // Create a map of projectId to totalViews
    const viewsMap = new Map<bigint, number>()
    dailyViews.forEach((entry) => {
      viewsMap.set(entry.projectId, entry._sum.views ?? 0)
    })

    // Update totalViews for all existing projectStats entries from projectClicks
    Object.keys(projectStats).forEach((key) => {
      const projectStat = projectStats[key]
      if (projectStat && projectStat.projectId) {
        projectStat.totalViews = viewsMap.get(BigInt(projectStat.projectId)) ?? 0
      }
    })

    // Ensure every portfolio repository has an entry and enrich with upvote counts and totalViews
    portfolioRepos.forEach((repo) => {
      const key = repo.id.toString()
      if (!projectStats[key]) {
        projectStats[key] = {
          projectId: repo.id,
          portfolioProjectId: repo.id,
          githubId: Number(repo.repository.githubId),
          projectName: repo.repository.name,
          clickCount: 0,
          totalViews: 0,
          lastClicked: null
        }
      }
      projectStats[key].upvoteCount = upvoteCountMap.get(repo.id) ?? 0
      // Update totalViews for all entries (both existing and new)
      projectStats[key].totalViews = viewsMap.get(BigInt(repo.id)) ?? 0
    })
    
    // Get social clicks
    const socialClicks = await prisma.socialClick.findMany({
      where: { portfolioId: parseInt(portfolioId) },
      select: {
        socialType: true,
        socialUrl: true,
        clickedAt: true
      },
      orderBy: { clickedAt: 'desc' }
    })
    
    // Group social clicks by type
    const socialStats = socialClicks.reduce((acc, click) => {
      if (!acc[click.socialType]) {
        acc[click.socialType] = {
          socialType: click.socialType,
          socialUrl: click.socialUrl,
          clickCount: 0,
          lastClicked: click.clickedAt.toISOString() // Convert Date to string
        }
      }
      acc[click.socialType].clickCount++
      return acc
    }, {} as Record<string, any>)
    
    // Get session data for time spent
    const sessions = await prisma.portfolioSession.findMany({
      where: { 
        portfolioId: parseInt(portfolioId),
        timeSpent: { not: null }
      },
      select: {
        timeSpent: true,
        startTime: true,
        endTime: true
      }
    })
    
    // Calculate average time spent
    const validSessions = sessions.filter(s => s.timeSpent && s.timeSpent > 0)
    const averageTimeSpent = validSessions.length > 0 
      ? Math.round(validSessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / validSessions.length)
      : 0
    
    // Get total sessions
    const totalSessions = await prisma.portfolioSession.count({
      where: { portfolioId: parseInt(portfolioId) }
    })
    
    console.log(`✅ Analytics: Detailed data fetched - ${Object.keys(projectStats).length} projects, ${Object.keys(socialStats).length} social types`)
    
    return NextResponse.json({
      projects: Object.values(projectStats).sort((a: any, b: any) => b.clickCount - a.clickCount),
      socials: Object.values(socialStats).sort((a: any, b: any) => b.clickCount - a.clickCount),
      timeSpent: {
        average: averageTimeSpent,
        totalSessions,
        validSessions: validSessions.length
      }
    })
    
  } catch (error) {
    console.error("❌ Analytics: Error fetching detailed analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch detailed analytics" },
      { status: 500 }
    )
  }
}
