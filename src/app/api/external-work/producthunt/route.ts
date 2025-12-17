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

    // Check if this is a dashboard request (authenticated user viewing their own data)
    const sessionValidation = await validateSession(request)
    const isAuthenticated = sessionValidation.valid && sessionValidation.user

    // Try to find portfolio by portfolio username first (customUsername or githubUsername)
    // For authenticated users (dashboard), don't require isPublished
    // For public portfolios, only fetch if published
    let portfolio = await prisma.portfolio.findFirst({
      where: {
        OR: [
          { customUsername: username },
          { user: { githubUsername: username } }
        ],
        ...(isAuthenticated ? {} : { isPublished: true })
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
          ...(isAuthenticated ? {} : { isPublished: true })
        },
        include: {
          user: true
        }
      })
    }

    // For authenticated users, also try to find by their own userId
    if (!portfolio && isAuthenticated) {
      portfolio = await prisma.portfolio.findFirst({
        where: {
          userId: sessionValidation.user!.id
        },
        include: {
          user: true
        }
      })
    }

    if (!portfolio || !portfolio.userId) {
      console.log('❌ Portfolio not found:', { username, isAuthenticated })
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
      console.log('❌ ProductHunt username not found in portfolio:', { portfolioId: portfolio.id, userId: portfolio.userId })
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'ProductHunt username not found in portfolio'
      })
    }

    console.log('✅ Found portfolio:', { portfolioId: portfolio.id, productHuntUsername, userId: portfolio.userId })

    // Get OAuth token from database
    // Note: After adding OAuthToken model, run: npx prisma generate
    let oauthToken = null
    try {
      oauthToken = await (prisma as any).oAuthToken.findFirst({
        where: { 
          userId: portfolio.userId,
          platform: 'producthunt'
        }
      })
    } catch (tokenError) {
      console.error('Error fetching OAuth token:', tokenError)
      // If OAuthToken model doesn't exist or Prisma client not regenerated, return empty
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'ProductHunt integration not available. Please contact support.'
      })
    }

    if (!oauthToken) {
      console.log('❌ OAuth token not found:', { userId: portfolio.userId, platform: 'producthunt' })
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'ProductHunt account not connected. Please connect your account first.'
      })
    }

    console.log('✅ OAuth token found:', { userId: portfolio.userId, hasAccessToken: !!oauthToken.accessToken, expiresAt: oauthToken.expiresAt })

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
      
      console.log('📊 ProductHunt API response:', { 
        hasData: !!data?.data, 
        hasUser: !!data?.data?.user,
        hasMadePosts: !!data?.data?.user?.madePosts,
        edgesCount: data?.data?.user?.madePosts?.edges?.length || 0
      })
      
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

