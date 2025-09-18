import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

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

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

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
      
      image: 
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        null,
      
      siteName: 
        $('meta[property="og:site_name"]').attr('content') ||
        new URL(url).hostname,
      
      url: url,
      
      favicon: 
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="apple-touch-icon"]').attr('href') ||
        `${new URL(url).origin}/favicon.ico`,
      
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

    // Clean up relative URLs
    if (metadata.image && metadata.image.startsWith('/')) {
      metadata.image = new URL(metadata.image, url).href
    }
    
    if (metadata.favicon && metadata.favicon.startsWith('/')) {
      metadata.favicon = new URL(metadata.favicon, url).href
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
      language: 'Web Project',
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
