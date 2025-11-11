import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // total users
    const totalUsers = await prisma.user.count()

    // active users (users updated in last 10 mins)
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    })

    // users added today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    })

    return NextResponse.json({ totalUsers, activeUsers, todayUsers })
  } catch (error) {
    console.error("Error fetching community stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
