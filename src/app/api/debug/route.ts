import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        portfolio: {
          include: {
            skills: true,
            repositories: {
              include: {
                repository: true
              }
            }
          }
        }
      }
    })

    // Get all portfolios
    const portfolios = await prisma.portfolio.findMany({
      include: {
        user: true,
        skills: true,
        repositories: {
          include: {
            repository: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        users,
        portfolios,
        userCount: users.length,
        portfolioCount: portfolios.length
      }
    })

  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      { error: "Debug failed", details: error },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
