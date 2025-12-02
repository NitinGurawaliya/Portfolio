import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Screenshot capture API endpoint
 * Captures a screenshot of a landing page's hero section
 * Uses a headless browser service or API
 * If projectId is provided, saves the screenshot to the database
 */
export async function POST(req: NextRequest) {
  try {
    const { url, projectId } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Screenshot capture options:
    // Option 1: Use a screenshot service API (e.g., ScreenshotAPI, Bannerbear, urlbox.io)
    // Option 2: Use Puppeteer/Playwright in a serverless function (requires additional setup)
    // Option 3: Use a third-party service
    
    // For now, we'll try to use a screenshot service if configured
    // If not configured, we'll return an error and the frontend will show placeholder
    
    const screenshotApiKey = process.env.SCREENSHOT_API_KEY || ''
    const screenshotApiUrl = process.env.SCREENSHOT_API_URL || ''
    
    // If no screenshot service is configured, return error (frontend will handle gracefully)
    if (!screenshotApiKey || !screenshotApiUrl) {
      return NextResponse.json(
        { 
          error: "Screenshot service not configured",
          message: "Screenshot capture is optional. Configure SCREENSHOT_API_KEY and SCREENSHOT_API_URL to enable.",
          fallback: "Use /api/extract-metadata to get OG image instead"
        },
        { status: 503 }
      )
    }

    // Build screenshot URL (adjust parameters based on your screenshot service)
    const screenshotUrl = new URL(screenshotApiUrl)
    
    // Common parameters for screenshot services
    // Adjust these based on your specific service's API
    screenshotUrl.searchParams.set('token', screenshotApiKey)
    screenshotUrl.searchParams.set('url', url)
    screenshotUrl.searchParams.set('width', '1200')
    screenshotUrl.searchParams.set('height', '630')
    
    // Service-specific parameters (uncomment based on your service)
    // For screenshotapi.net:
    screenshotUrl.searchParams.set('output', 'image')
    screenshotUrl.searchParams.set('file_type', 'png')
    screenshotUrl.searchParams.set('wait_for_event', 'load')
    screenshotUrl.searchParams.set('delay', '1000') // Wait 1 second for page to load (reduced to speed up)
    screenshotUrl.searchParams.set('viewport_width', '1200')
    screenshotUrl.searchParams.set('viewport_height', '630')
    
    // For urlbox.io (alternative):
    // screenshotUrl.searchParams.set('format', 'png')
    // Remove the above screenshotapi.net specific params if using urlbox.io

    try {
      // Use a reasonable timeout - screenshot services can take 5-8 seconds
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000) // 8 second timeout (screenshot services need time)
      
      const screenshotResponse = await fetch(screenshotUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeout)

      if (!screenshotResponse.ok) {
        throw new Error(`Screenshot API returned ${screenshotResponse.status}`)
      }

      // Get the screenshot as a buffer
      const screenshotBuffer = await screenshotResponse.arrayBuffer()
      const base64Image = Buffer.from(screenshotBuffer).toString('base64')
      const dataUrl = `data:image/png;base64,${base64Image}`

      // If projectId is provided, save screenshot to database
      if (projectId) {
        try {
          // Find the PortfolioRepository by project ID
          const portfolioRepo = await prisma.portfolioRepository.findUnique({
            where: { id: Number(projectId) },
            select: { repositoryId: true }
          })

          if (portfolioRepo) {
            // Update the repository logo with the screenshot
            await prisma.repository.update({
              where: { id: portfolioRepo.repositoryId },
              data: { logo: dataUrl }
            })
          }
        } catch (dbError) {
          console.error("Failed to save screenshot to database:", dbError)
          // Continue even if DB save fails - return screenshot anyway
        }
      }

      return NextResponse.json({
        success: true,
        screenshot: dataUrl,
        url: url
      })

    } catch (screenshotError: any) {
      // Check if it's a timeout or connection error
      const isTimeout = screenshotError.name === 'AbortError' || 
                       screenshotError.code === 'UND_ERR_CONNECT_TIMEOUT' ||
                       screenshotError.message?.includes('timeout') ||
                       screenshotError.message?.includes('Timeout')
      
      console.error("Screenshot capture error:", {
        error: screenshotError.message,
        code: screenshotError.code,
        name: screenshotError.name,
        isTimeout
      })
      
      // Return appropriate error message
      return NextResponse.json(
        { 
          error: "Failed to capture screenshot",
          message: isTimeout 
            ? "Screenshot service timeout - service may be slow or unavailable"
            : screenshotError.message || "Screenshot service unavailable",
          isTimeout,
          // Suggest using OG image extraction as fallback
          fallback: "OG image extraction is available as an alternative"
        },
        { status: isTimeout ? 504 : 500 } // 504 Gateway Timeout for timeout errors
      )
    }

  } catch (error: any) {
    console.error("Error in screenshot API:", error)
    return NextResponse.json(
      { error: "Failed to process screenshot request" },
      { status: 500 }
    )
  }
}

