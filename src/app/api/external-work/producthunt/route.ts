import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session-validator'
import { prisma } from '@/lib/prisma'

export interface ProductHuntProject {
  id: string
  name: string
  tagline: string
  votes: number
  url: string
  thumbnail: string
}

/**
 * Fetch ProductHunt projects for a user
 * Requires OAuth token (user must connect their ProductHunt account first)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Try to find portfolio by portfolio username first (customUsername or githubUsername)
    // Then fallback to ProductHunt username if not found
    // For public portfolios, only fetch if published
    let portfolio = await prisma.portfolio.findFirst({
      where: {
        OR: [
          { customUsername: username, isPublished: true },
          { user: { githubUsername: username }, isPublished: true }
        ]
      },
      include: {
        user: true
      }
    })

    // If not found by portfolio username, try ProductHunt username
    if (!portfolio) {
      portfolio = await prisma.portfolio.findFirst({
        where: {
          productHuntUsername: username,
          isPublished: true
        },
        include: {
          user: true
        }
      })
    }

    if (!portfolio || !portfolio.userId) {
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'Portfolio not found or not published'
      })
    }

    // Get ProductHunt username from portfolio
    const productHuntUsername = portfolio.productHuntUsername
    if (!productHuntUsername) {
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'ProductHunt username not found in portfolio'
      })
    }

    // Get OAuth token from database
    // Note: After adding OAuthToken model, run: npx prisma generate
    const oauthToken = await (prisma as any).oAuthToken.findUnique({
      where: { userId: portfolio.userId }
    })

    if (!oauthToken || oauthToken.platform !== 'producthunt') {
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'ProductHunt account not connected. Please connect your account first.'
      })
    }

    // Check if token is expired
    if (oauthToken.expiresAt && oauthToken.expiresAt < new Date()) {
      // TODO: Implement token refresh logic
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'ProductHunt token expired. Please reconnect your account.'
      })
    }

    try {
      // Fetch user's made posts using ProductHunt GraphQL API
      // Use the ProductHunt username from portfolio (not the portfolio username)
      const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${oauthToken.accessToken}`
        },
        body: JSON.stringify({
          query: `
            query($username: String!) {
              user(username: $username) {
                madePosts {
                  edges {
                    node {
                      id
                      name
                      tagline
                      votesCount
                      url
                      thumbnail {
                        imageUrl
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { username: productHuntUsername }
        })
      })

      if (!response.ok) {
        console.error('ProductHunt API error:', response.status, await response.text())
        return NextResponse.json({
          success: true,
          projects: [],
          username,
          message: 'Failed to fetch projects from ProductHunt'
        })
      }

      const data = await response.json()
      
      // Transform GraphQL response to our format
      const projects: ProductHuntProject[] = (data?.data?.user?.madePosts?.edges || []).map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        tagline: edge.node.tagline || '',
        votes: edge.node.votesCount || 0,
        url: edge.node.url || `https://www.producthunt.com/posts/${edge.node.id}`,
        thumbnail: edge.node.thumbnail?.imageUrl || ''
      }))
      
      return NextResponse.json({
        success: true,
        projects,
        username
      })

    } catch (fetchError) {
      console.error('ProductHunt API error:', fetchError)
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'Failed to fetch ProductHunt projects. Please try again later.'
      })
    }

  } catch (error) {
    console.error('Error fetching ProductHunt projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ProductHunt projects' },
      { status: 500 }
    )
  }
}

