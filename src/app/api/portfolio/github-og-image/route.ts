import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

/**
 * Proxy endpoint for GitHub OG images
 * Fetches the actual OG image by parsing the repository HTML page
 * Falls back to opengraph.githubassets.com if parsing fails
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo parameters are required" },
        { status: 400 }
      )
    }

    const repoUrl = `https://github.com/${owner}/${repo}`
    let ogImageUrl: string | null = null

    // Method 1: Parse the repository HTML page to get the actual OG image
    // Use a shorter timeout and race condition to avoid long waits
    try {
      const htmlController = new AbortController()
      const htmlTimeout = setTimeout(() => htmlController.abort(), 3000) // 3 second timeout for HTML fetch
      
      const htmlResponse = await fetch(repoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: htmlController.signal,
      })

      clearTimeout(htmlTimeout)

      if (htmlResponse.ok) {
        // Only read first 50KB of HTML to speed up parsing (OG meta tags are usually in the head)
        const html = await htmlResponse.text()
        const $ = cheerio.load(html)

        // Extract OG image from meta tags (check head first, then body)
        const ogImage = $('head meta[property="og:image"]').attr('content') ||
                       $('head meta[name="twitter:image"]').attr('content') ||
                       $('head meta[name="twitter:image:src"]').attr('content') ||
                       $('meta[property="og:image"]').attr('content') ||
                       $('meta[name="twitter:image"]').attr('content')

        if (ogImage) {
          // Make sure it's a full URL
          ogImageUrl = ogImage.startsWith('http') 
            ? ogImage 
            : new URL(ogImage, 'https://github.com').href
          
          // Skip if it's the default GitHub logo
          // Default GitHub OG images often contain 'opengraph.githubassets.com' with just the logo
          // Real repo OG images are usually from 'repository-images.githubusercontent.com'
          if (ogImageUrl.includes('repository-images.githubusercontent.com')) {
            // This is likely a real custom OG image
            console.log(`✅ Found custom OG image for ${owner}/${repo}`)
          } else if (ogImageUrl.includes('opengraph.githubassets.com')) {
            // This might be the default logo, but let's try it anyway
            console.log(`⚠️ Using opengraph.githubassets.com for ${owner}/${repo} (might be default)`)
          }
        }
      }
    } catch (htmlError: any) {
      // Silently fall back to direct OG image URL - don't log unless it's not a timeout
      if (htmlError.name !== 'AbortError') {
        console.log(`HTML parse failed for ${owner}/${repo}, using fallback`)
      }
    }

    // Method 2: Fallback to direct opengraph.githubassets.com URL
    if (!ogImageUrl) {
      ogImageUrl = `https://opengraph.githubassets.com/${owner}/${repo}`
      console.log(`Using fallback OG image URL for ${owner}/${repo}`)
    }

    // Fetch the actual image
    try {
      let imageResponse: Response | null = null
      
      // Try up to 2 times with exponential backoff
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            // Wait before retry (exponential backoff: 500ms, 1000ms)
            await new Promise(resolve => setTimeout(resolve, 500 * attempt))
          }
          
          imageResponse = await fetch(ogImageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/png,image/webp,image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': 'https://github.com/',
            },
            signal: AbortSignal.timeout(8000), // 8 second timeout
            cache: 'no-cache',
          })

          if (imageResponse.ok) {
            break // Success, exit retry loop
          }
          
          // If rate limited, wait longer before retry
          if (imageResponse.status === 429) {
            const retryAfter = imageResponse.headers.get('Retry-After')
            if (retryAfter) {
              await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000))
            }
          }
        } catch (fetchError: any) {
          // Continue to next attempt
          if (attempt === 1) {
            // Last attempt failed
            throw fetchError
          }
        }
      }

      if (!imageResponse || !imageResponse.ok) {
        // Return a more specific error
        const status = imageResponse?.status || 500
        return NextResponse.json(
          { 
            error: "Failed to fetch GitHub OG image",
            status: status,
            message: status === 429 ? "Rate limited. Please try again later." : "OG image not available for this repository."
          },
          { status: status }
        )
      }

      // Get the image as a buffer
      const imageBuffer = await imageResponse.arrayBuffer()
      
      // Check if this is the default GitHub logo by checking file size
      const bufferSize = imageBuffer.byteLength
      const isLikelyDefaultLogo = bufferSize < 50000 // Default logos are usually < 50KB
      
      // Determine content type from response or default to PNG
      const contentType = imageResponse.headers.get('content-type') || 'image/png'

      // Return the image with proper headers
      // Include the actual OG image URL in headers so client can save it
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
          'X-GitHub-OG-Image': 'true',
          'X-Is-Default-Logo': isLikelyDefaultLogo ? 'true' : 'false',
          'X-OG-Image-Source': ogImageUrl.includes('repository-images') ? 'custom' : 'default',
          'X-Actual-OG-Image-URL': ogImageUrl, // The actual OG image URL that was fetched (for saving to DB)
        },
      })
    } catch (fetchError: any) {
      console.error(`Error fetching GitHub OG image for ${owner}/${repo}:`, fetchError.message)
      return NextResponse.json(
        { 
          error: "Failed to fetch GitHub OG image", 
          message: fetchError.message,
          owner,
          repo
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in GitHub OG image proxy:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
