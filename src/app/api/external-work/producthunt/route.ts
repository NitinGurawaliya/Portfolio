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

type GraphQLError = { message?: string }

const PH_GRAPHQL_URL = 'https://api.producthunt.com/v2/api/graphql'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null

const getRecord = (value: unknown): UnknownRecord | null => (isRecord(value) ? value : null)

const getString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const makeGraphQLRequest = async ({
  accessToken,
  query,
  variables
}: {
  accessToken: string
  query: string
  variables: Record<string, unknown>
}) => {
  const response = await fetch(PH_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ query, variables })
  })

  // Product Hunt GraphQL often returns 200 with `errors`
  const payload: unknown = await response.json().catch(() => null)
  return { ok: response.ok, status: response.status, payload }
}

const extractProjectsFromUserPayload = (payload: unknown): ProductHuntProject[] => {
  const root = getRecord(payload)
  const data = getRecord(root?.data)
  const user = getRecord(data?.user)
  if (!user) return []

  // Support multiple possible shapes (schema changes / connection styles)
  const connection =
    user.madePosts ??
    user.posts ??
    user.createdPosts ??
    null

  const connectionRecord = getRecord(connection)
  const edges = connectionRecord?.edges
  const nodes = connectionRecord?.nodes

  const rawNodes: unknown[] = Array.isArray(edges)
    ? edges
        .map((e) => (getRecord(e)?.node as unknown))
        .filter((n): n is unknown => Boolean(n))
    : Array.isArray(nodes)
      ? nodes
      : []

  return rawNodes
    .map((node) => {
      const nodeRecord = getRecord(node)
      if (!nodeRecord) return null

      const votes =
        getNumber(nodeRecord.votesCount) ??
        getNumber(nodeRecord.votes_count) ??
        getNumber(nodeRecord.votes) ??
        0

      const url =
        getString(nodeRecord.url) ??
        getString(nodeRecord.website) ??
        ''

      const thumbnailRecord = getRecord(nodeRecord.thumbnail)
      const thumbnail =
        getString(thumbnailRecord?.imageUrl) ??
        getString(thumbnailRecord?.url) ??
        getString(nodeRecord.thumbnailImageUrl) ??
        ''

      const id = getString(nodeRecord.id) ?? ''
      const name = getString(nodeRecord.name) ?? ''
      const tagline = getString(nodeRecord.tagline) ?? ''

      if (!id || !name) return null

      return {
        id,
        name,
        tagline,
        votes,
        url,
        thumbnail
      }
    })
    .filter((p): p is ProductHuntProject => Boolean(p))
}

const fetchProductHuntProjects = async ({
  accessToken,
  username
}: {
  accessToken: string
  username: string
}): Promise<{ projects: ProductHuntProject[]; message?: string }> => {
  // Try a few query variants to tolerate Product Hunt schema evolution.
  // We intentionally keep the selection set minimal for compatibility.
  const variants: Array<{ label: string; query: string; variables: Record<string, unknown> }> = [
    {
      label: 'madePosts + thumbnail.imageUrl',
      query: `
        query($username: String!, $first: Int!) {
          user(username: $username) {
            madePosts(first: $first) {
              edges {
                node {
                  id
                  name
                  tagline
                  votesCount
                  url
                  thumbnail { imageUrl }
                }
              }
            }
          }
        }
      `,
      variables: { username, first: 30 }
    },
    {
      label: 'posts + thumbnail.imageUrl',
      query: `
        query($username: String!, $first: Int!) {
          user(username: $username) {
            posts(first: $first) {
              edges {
                node {
                  id
                  name
                  tagline
                  votesCount
                  url
                  thumbnail { imageUrl }
                }
              }
            }
          }
        }
      `,
      variables: { username, first: 30 }
    },
    {
      label: 'madePosts + thumbnail.url',
      query: `
        query($username: String!, $first: Int!) {
          user(username: $username) {
            madePosts(first: $first) {
              edges {
                node {
                  id
                  name
                  tagline
                  votesCount
                  url
                  thumbnail { url }
                }
              }
            }
          }
        }
      `,
      variables: { username, first: 30 }
    },
    {
      label: 'posts + thumbnail.url',
      query: `
        query($username: String!, $first: Int!) {
          user(username: $username) {
            posts(first: $first) {
              edges {
                node {
                  id
                  name
                  tagline
                  votesCount
                  url
                  thumbnail { url }
                }
              }
            }
          }
        }
      `,
      variables: { username, first: 30 }
    }
  ]

  let lastErrors: GraphQLError[] | undefined

  for (const variant of variants) {
    const { ok, status, payload } = await makeGraphQLRequest({
      accessToken,
      query: variant.query,
      variables: variant.variables
    })

    const payloadRecord = getRecord(payload)
    const errors = payloadRecord?.errors as unknown
    const graphQLErrors: GraphQLError[] | undefined = Array.isArray(errors) ? (errors as GraphQLError[]) : undefined
    const hasFatal = !ok

    if (hasFatal) {
      console.error('ProductHunt API HTTP error:', status, payload)
      return { projects: [], message: 'Failed to fetch projects from ProductHunt' }
    }

    if (Array.isArray(graphQLErrors) && graphQLErrors.length > 0) {
      lastErrors = graphQLErrors
      // If it's a schema mismatch ("Cannot query field ..."), try next variant.
      const joined = graphQLErrors.map((e) => e?.message || '').join(' | ')
      console.warn(`⚠️ ProductHunt GraphQL errors (${variant.label}):`, joined)
      continue
    }

    const projects = extractProjectsFromUserPayload(payload)
    return { projects }
  }

  const fallbackMessage =
    lastErrors && lastErrors.length > 0
      ? lastErrors.map((e) => e?.message).filter(Boolean).join(' | ')
      : 'Failed to fetch projects from ProductHunt'

  return { projects: [], message: fallbackMessage }
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
    const oauthToken = await prisma.oAuthToken.findUnique({
      where: {
        userId_platform: {
          userId: portfolio.userId,
          platform: 'producthunt'
        }
      }
    })

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
      // Fetch user's posts via ProductHunt GraphQL API (schema-tolerant)
      const { projects, message } = await fetchProductHuntProjects({
        accessToken: oauthToken.accessToken,
        username: productHuntUsername
      })
      
      if (message) {
        return NextResponse.json({
          success: true,
          projects,
          username,
          message
        })
      }

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

