import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { devLog } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    devLog("🔍 Debug endpoint called...")
    
    // Test database connection
    devLog("🔌 Testing database connection...")
    await prisma.$connect()
    devLog("✅ Database connected successfully")
    
    // Test simple query
    const userCount = await prisma.user.count()
    devLog("👥 User count:", userCount)
    
    // Get all users (limited for performance)
    const users = await prisma.user.findMany({
      take: 5,
      include: {
        portfolio: {
          include: {
            skills: true,
            socials: true,
            repositories: {
              include: {
                repository: true
              }
            }
          }
        }
      }
    })

    // Get all portfolios (limited)
    const portfolios = await prisma.portfolio.findMany({
      take: 5,
      include: {
        user: true,
        skills: true,
        socials: true,
        repositories: {
          include: {
            repository: true
          }
        }
      }
    })

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
      prismaVersion: "5.x",
      userCount,
      portfolioCount: portfolios.length,
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        githubUsername: u.githubUsername,
        hasPortfolio: !!u.portfolio
      })),
      portfolios: portfolios.map((p: any) => ({
        id: p.id,
        displayName: p.displayName,
        isPublished: p.isPublished,
        skillsCount: p.skills.length,
        socialsCount: p.socials.length,
        reposCount: p.repositories.length
      }))
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    })

  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      { error: "Debug failed", details: error },
      { status: 500 }
    )
  } finally {
    // Do not disconnect global prisma; connection is managed centrally
  }
}
