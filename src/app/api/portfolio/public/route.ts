import { NextRequest, NextResponse } from "next/server"
import { getPublicPortfolio } from "@/lib/portfolio/get-public-portfolio"

// Enable Next.js route caching with revalidation
export const revalidate = 300 // Revalidate every 5 minutes

/**
 * Optimized public portfolio API - minimal data, fast loading
 * Uses server-side function for better caching and performance
 */
export async function GET(req: NextRequest) {
  const startTime = performance.now()
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const portfolio = await getPublicPortfolio(username)
    
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    const responseData = {
      success: true,
      portfolio
    }

    const totalTime = performance.now() - startTime
    
    // Add caching headers for better performance
    const headers = new Headers()
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    console.log(`⚡ Public portfolio API: ${username}`, {
      totalTime: `${totalTime.toFixed(2)}ms`
    })

    return NextResponse.json(responseData, { headers })
  } catch (error) {
    console.error("Error fetching public portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

