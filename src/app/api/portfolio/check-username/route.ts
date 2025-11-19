import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // Check if request has body
    const contentType = req.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      )
    }

    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const { username, currentUserId } = body

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Clean username (remove spaces, convert to lowercase)
    const cleanUsername = username.trim().toLowerCase()
    
    if (cleanUsername.length < 3) {
      return NextResponse.json({
        available: false,
        message: "Username must be at least 3 characters long"
      })
    }

    if (cleanUsername.length > 20) {
      return NextResponse.json({
        available: false,
        message: "Username must be less than 20 characters"
      })
    }

    // Check for invalid characters (only allow alphanumeric, hyphens, underscores)
    if (!/^[a-z0-9-_]+$/.test(cleanUsername)) {
      return NextResponse.json({
        available: false,
        message: "Username can only contain letters, numbers, hyphens, and underscores"
      })
    }

    // Check if username is already taken by another user (case-insensitive)
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        OR: [
          {
            customUsername: {
              equals: cleanUsername,
              mode: 'insensitive'
            },
            user: currentUserId ? { id: { not: parseInt(currentUserId) } } : undefined
          },
          {
            user: {
              githubUsername: {
                equals: cleanUsername,
                mode: 'insensitive'
              },
              id: currentUserId ? { not: parseInt(currentUserId) } : undefined
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            githubUsername: true
          }
        }
      }
    })

    if (existingPortfolio) {
      return NextResponse.json({
        available: false,
        message: `Username "${cleanUsername}" is already taken`
      })
    }

    return NextResponse.json({
      available: true,
      message: `Username "${cleanUsername}" is available`
    })

  } catch (error) {
    console.error("Error checking username availability:", error)
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    )
  }
}
