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
    
    // Group project clicks by repository ID (GitHub ID)
    const projectStats = projectClicks.reduce((acc, click) => {
      // Try to find by portfolio repository ID first
      let repoInfo = projectIdToRepoId[click.projectId]
      
      // If not found, try by database repository ID
      if (!repoInfo) {
        repoInfo = dbRepoIdToRepoId[click.projectId]
      }
      
      if (!repoInfo) {
        console.log(`🔍 DEBUG: No repository found for project ID ${click.projectId}`)
        return acc
      }
      
      const key = repoInfo.githubId.toString()
      console.log(`🔍 DEBUG: Processing click for project ${click.projectId} -> GitHub ID ${repoInfo.githubId} (${click.projectName})`)
      
      if (!acc[key]) {
        acc[key] = {
          projectId: repoInfo.githubId, // Use GitHub ID for frontend matching
          projectName: click.projectName,
          clickCount: 0,
          lastClicked: click.clickedAt
        }
        console.log(`🔍 DEBUG: Created new entry for GitHub project ${repoInfo.githubId}`)
      }
      acc[key].clickCount++
      console.log(`🔍 DEBUG: Incremented count for GitHub project ${repoInfo.githubId}, new count: ${acc[key].clickCount}`)
      return acc
    }, {} as Record<string, any>)
    
    console.log(`🔍 DEBUG: Final project stats:`, projectStats)
    console.log(`🔍 DEBUG: Project stats keys:`, Object.keys(projectStats))
    console.log(`🔍 DEBUG: Project stats values:`, Object.values(projectStats))
    
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
          lastClicked: click.clickedAt
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
