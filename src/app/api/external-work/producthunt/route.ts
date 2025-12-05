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

    // Validate session (optional - can work for public portfolios too)
    const sessionValidation = await validateSession(request)
    
    // For now, we'll fetch without OAuth token (public data)
    // TODO: In production, retrieve stored OAuth token from database
    // and use it to fetch user's made posts via GraphQL API

    try {
      // ProductHunt GraphQL API endpoint
      // Note: This requires OAuth token for private data (user's made posts)
      // For public data, we can use their public API endpoints
      
      // Since we don't have OAuth token stored yet, we'll return empty
      // Once OAuth is implemented, use this query:
      /*
      const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
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
          variables: { username }
        })
      })
      */

      // For MVP, return empty array until OAuth tokens are stored
      // User needs to connect their ProductHunt account first
      const projects: ProductHuntProject[] = []
      
      return NextResponse.json({
        success: true,
        projects,
        username,
        message: sessionValidation.valid 
          ? 'Please connect your ProductHunt account to see your projects' 
          : 'ProductHunt projects will be displayed after account connection'
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

