import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const repos = await prisma.repository.findMany({
      select: {
        id: true,
        name: true,
        favicon: true,
        logo: true,
        isImported: true,
        htmlUrl: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    const iconStatus = repos.map(repo => {
      const hasRealFavicon = !!repo.favicon
      const hasGeneratedLogo = !!repo.logo && repo.logo.includes('data:image/svg+xml;base64')
      
      return {
        id: repo.id,
        name: repo.name,
        type: repo.isImported ? 'Imported' : 'GitHub',
        hasRealFavicon,
        hasGeneratedLogo,
        faviconUrl: repo.favicon,
        logoType: hasGeneratedLogo ? 'Generated SVG' : 'None',
        htmlUrl: repo.htmlUrl
      }
    })
    
    const summary = {
      total: repos.length,
      realFavicons: iconStatus.filter(r => r.hasRealFavicon).length,
      generatedLogos: iconStatus.filter(r => r.hasGeneratedLogo).length,
      noIcons: iconStatus.filter(r => !r.hasRealFavicon && !r.hasGeneratedLogo).length
    }
    
    return NextResponse.json({
      summary,
      repositories: iconStatus
    })
    
  } catch (error) {
    console.error('Error fetching icon status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch icon status' },
      { status: 500 }
    )
  }
}
