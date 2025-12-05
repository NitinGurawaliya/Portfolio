import { NextRequest, NextResponse } from "next/server"

/**
 * Proxy endpoint for OG images from external URLs
 * Fetches the image on the server side to bypass CORS restrictions
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Fetch the image
    try {
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/png,image/webp,image/jpeg,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': new URL(imageUrl).origin + '/',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        cache: 'no-cache',
      })

      if (!imageResponse.ok) {
        console.error(`❌ Failed to fetch OG image from ${imageUrl}: ${imageResponse.status}`)
        return NextResponse.json(
          { 
            error: "Failed to fetch OG image",
            status: imageResponse.status,
            message: "OG image not available for this URL."
          },
          { status: imageResponse.status }
        )
      }

      // Get the image as a buffer
      const imageBuffer = await imageResponse.arrayBuffer()
      
      // Determine content type from response or default to PNG
      const contentType = imageResponse.headers.get('content-type') || 'image/png'

      // Return the image with proper headers
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
          'X-OG-Image-Proxy': 'true',
          'Access-Control-Allow-Origin': '*', // Allow CORS for the proxied image
        },
      })
    } catch (fetchError: any) {
      console.error(`❌ Error fetching OG image from ${imageUrl}:`, fetchError.message)
      return NextResponse.json(
        { 
          error: "Failed to fetch OG image", 
          message: fetchError.message,
          url: imageUrl
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in OG image proxy:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

