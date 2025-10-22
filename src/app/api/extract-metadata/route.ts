import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { ImageResponse } from "next/og"

// Helper function to generate a branded logo from text
function generateLogoBase64(text: string): string {
  // Take first 2 words and clean them, limit to 2 characters max
  const words = text.split(' ').slice(0, 2).filter(word => word.length > 0)
  const logoText = words.map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2)
  
  // Create a small, square SVG with white background and border
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="white" stroke="#e5e7eb" stroke-width="1"/>
      <text x="12" y="16" font-family="Arial, sans-serif" font-size="8" font-weight="600" 
            text-anchor="middle" fill="#374151" letter-spacing="-0.3px">${logoText}</text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// Helper function to extract and validate favicon
async function extractFavicon(url: string, $: cheerio.CheerioAPI): Promise<string | null> {
  const baseUrl = new URL(url).origin
  
  // Try multiple favicon sources in order of preference
  const faviconSelectors = [
    'link[rel="icon"][sizes="32x32"]',
    'link[rel="icon"][sizes="16x16"]', 
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]'
  ]
  
  for (const selector of faviconSelectors) {
    const faviconUrl = $(selector).attr('href')
    if (faviconUrl) {
      try {
        const fullUrl = faviconUrl.startsWith('http') 
          ? faviconUrl 
          : new URL(faviconUrl, baseUrl).href
        
        // Validate that the favicon exists and is accessible
        const response = await fetch(fullUrl, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          console.log(`✅ Found favicon: ${fullUrl}`)
          return fullUrl
        }
      } catch (error) {
        console.log(`Failed to validate favicon: ${faviconUrl}`)
        continue
      }
    }
  }
  
  // Try default favicon.ico
  try {
    const defaultFavicon = `${baseUrl}/favicon.ico`
    const response = await fetch(defaultFavicon, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(5000)
    })
    if (response.ok && response.headers.get('content-type')?.includes('image')) {
      console.log(`✅ Found default favicon: ${defaultFavicon}`)
      return defaultFavicon
    }
  } catch (error) {
    console.log('Default favicon.ico not found')
  }
  
  console.log(`❌ No favicon found for ${url}`)
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

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

    // Fetch the webpage with a timeout to avoid hanging requests
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch webpage" },
        { status: 400 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract metadata
    const metadata = {
      title: 
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        'Untitled Project',
      
      description: 
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        'No description available',
      
      siteName: 
        $('meta[property="og:site_name"]').attr('content') ||
        new URL(url).hostname,
      
      url: url,
      
      favicon: null as string | null,
      logo: null as string | null,
      
      type: 
        $('meta[property="og:type"]').attr('content') ||
        'website',
        
      keywords: 
        $('meta[name="keywords"]').attr('content') ||
        '',
        
      author: 
        $('meta[name="author"]').attr('content') ||
        $('meta[property="article:author"]').attr('content') ||
        '',
    }

    // Extract and validate favicon
    try {
      metadata.favicon = await extractFavicon(url, $)
    } catch (error) {
      console.log('Error extracting favicon:', error)
    }

    // Generate logo as fallback if no favicon found
    if (!metadata.favicon) {
      metadata.logo = generateLogoBase64(metadata.title)
    }

    // Generate a unique ID for the imported project
    const projectId = Date.now()

    // Create a repository-like object for consistency
    const projectData = {
      id: projectId,
      name: metadata.title.substring(0, 100), // Limit length
      fullName: `${metadata.siteName}/${metadata.title}`,
      description: metadata.description.substring(0, 500), // Limit length
      htmlUrl: metadata.url,
      homepage: metadata.url,
      language: '',
      stargazersCount: 0,
      forksCount: 0,
      isPrivate: false,
      isFork: false,
      size: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pushedAt: new Date().toISOString(),
      // Additional metadata for imported projects
      isImported: true,
      favicon: metadata.favicon,
      logo: metadata.logo,
      siteName: metadata.siteName,
      keywords: metadata.keywords,
      author: metadata.author,
    }

    return NextResponse.json({
      success: true,
      metadata,
      projectData
    })

  } catch (error) {
    console.error("Error extracting metadata:", error)
    return NextResponse.json(
      { error: "Failed to extract metadata from URL" },
      { status: 500 }
    )
  }
}
