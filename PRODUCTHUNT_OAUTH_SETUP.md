# ProductHunt OAuth Setup Guide

## Overview
ProductHunt uses OAuth 2.0 for API authentication. To fetch user's projects, you need to set up OAuth application and get access tokens.

## Step 1: Create ProductHunt OAuth Application

1. **Go to ProductHunt API Dashboard**
   - Visit: https://www.producthunt.com/v2/api/graphql
   - Or navigate to: ProductHunt → Settings → API

2. **Create New Application**
   - Click "Create Application" or "New OAuth App"
   - Fill in the application details:
     - **Application Name**: Devfolio Portfolio
     - **Description**: Portfolio showcase integration
     - **Redirect URI**: `https://yourdomain.com/api/auth/producthunt/callback`
     - For local development: `http://localhost:3000/api/auth/producthunt/callback`

3. **Get Credentials**
   - After creating, you'll receive:
     - `CLIENT_ID`: Your application client ID
     - `CLIENT_SECRET`: Your application secret (keep this secure!)

## Step 2: Add Environment Variables

Add these to your `.env.local` (development) and `.env.production` (production):

```env
# ProductHunt OAuth Credentials
PRODUCTHUNT_CLIENT_ID=your_client_id_here
PRODUCTHUNT_CLIENT_SECRET=your_client_secret_here
PRODUCTHUNT_REDIRECT_URI=https://yourdomain.com/api/auth/producthunt/callback
```

## Step 3: Implement OAuth Flow

### 3.1 Create OAuth Authorization Endpoint

Create `src/app/api/auth/producthunt/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session-validator'

export async function GET(request: NextRequest) {
  const sessionValidation = await validateSession(request)
  
  if (!sessionValidation.valid || !sessionValidation.user) {
    return NextResponse.redirect('/auth?error=unauthorized')
  }

  const clientId = process.env.PRODUCTHUNT_CLIENT_ID
  const redirectUri = process.env.PRODUCTHUNT_REDIRECT_URI || 
    `${request.nextUrl.origin}/api/auth/producthunt/callback`
  
  // Generate state for CSRF protection
  const state = Buffer.from(JSON.stringify({
    userId: session.user.id,
    timestamp: Date.now()
  })).toString('base64')

  // Store state in session/cookie for verification
  const authUrl = `https://api.producthunt.com/v2/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=public+private&` +
    `state=${encodeURIComponent(state)}`

  return NextResponse.redirect(authUrl)
}
```

### 3.2 Create OAuth Callback Endpoint

Create `src/app/api/auth/producthunt/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session-validator'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const sessionValidation = await validateSession(request)
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`/dashboard?error=producthunt_auth_failed`)
  }

  if (!code || !sessionValidation.valid || !sessionValidation.user) {
    return NextResponse.redirect(`/dashboard?error=invalid_request`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.producthunt.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.PRODUCTHUNT_CLIENT_ID,
        client_secret: process.env.PRODUCTHUNT_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.PRODUCTHUNT_REDIRECT_URI || 
          `${request.nextUrl.origin}/api/auth/producthunt/callback`
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token } = tokenData

    // Store tokens securely (encrypted in database)
    // Option 1: Store in User table
    // Option 2: Store in separate OAuthTokens table
    // Option 3: Use environment-based storage for MVP

    // For MVP, you can store access_token in user session
    // In production, encrypt and store in database

    // Fetch user's ProductHunt profile to get username
    const profileResponse = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        query: `
          query {
            me {
              username
              name
            }
          }
        `
      })
    })

    const profileData = await profileResponse.json()
    const username = profileData?.data?.me?.username

    if (username && sessionValidation.user) {
      // Update user's portfolio with ProductHunt username
      await prisma.portfolio.update({
        where: { userId: sessionValidation.user.id },
        data: {
          productHuntUsername: username
        }
      })
    }

    return NextResponse.redirect('/dashboard?producthunt_connected=true')

  } catch (error) {
    console.error('ProductHunt OAuth error:', error)
    return NextResponse.redirect(`/dashboard?error=producthunt_connection_failed`)
  }
}
```

## Step 4: Update ProductHunt API Route

Update `src/app/api/external-work/producthunt/route.ts` to use OAuth:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session-validator'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const sessionValidation = await validateSession(request)
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Get user's stored access token from database
    // For MVP, you might need to re-authenticate or use stored token
    if (!sessionValidation.valid || !sessionValidation.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionValidation.user.id },
      include: { portfolio: true }
    })

    // TODO: Retrieve stored access_token from database (encrypted)
    // For now, this is a placeholder
    const accessToken = null // Get from database

    if (!accessToken) {
      return NextResponse.json({
        success: true,
        projects: [],
        username,
        message: 'Please connect your ProductHunt account first'
      })
    }

    // Fetch user's made products using GraphQL API
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

    if (!response.ok) {
      throw new Error('Failed to fetch from ProductHunt API')
    }

    const data = await response.json()
    const posts = data?.data?.user?.madePosts?.edges || []

    const projects = posts.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      tagline: edge.node.tagline,
      votes: edge.node.votesCount,
      url: edge.node.url,
      thumbnail: edge.node.thumbnail?.imageUrl || null
    }))

    return NextResponse.json({
      success: true,
      projects,
      username,
      message: 'ProductHunt projects fetched successfully'
    })

  } catch (error) {
    console.error('Error fetching ProductHunt projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ProductHunt projects' },
      { status: 500 }
    )
  }
}
```

## Step 5: Add Connect Button in Dashboard

Update `src/components/dashboard/SocialsSection.tsx` to add "Connect ProductHunt" button:

```typescript
// Add this in the ProductHunt section
<Button
  onClick={() => window.location.href = '/api/auth/producthunt'}
  className="mt-2"
>
  Connect ProductHunt Account
</Button>
```

## Step 6: Store OAuth Tokens Securely

### Option A: Store in Database (Recommended)

Add to `prisma/schema.prisma`:

```prisma
model OAuthToken {
  id                String   @id @default(cuid())
  userId            Int      @unique
  platform          String   // 'producthunt'
  accessToken       String   @db.Text // Encrypted
  refreshToken      String?  @db.Text // Encrypted
  expiresAt         DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Option B: Use Environment Variables (For MVP)

Store tokens in encrypted cookies or session storage.

## Step 7: Handle Token Refresh

ProductHunt tokens expire. Implement refresh logic:

```typescript
async function refreshProductHuntToken(refreshToken: string) {
  const response = await fetch('https://api.producthunt.com/v2/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.PRODUCTHUNT_CLIENT_ID,
      client_secret: process.env.PRODUCTHUNT_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })
  
  return response.json()
}
```

## Important Notes

1. **Security**: Never expose `CLIENT_SECRET` in client-side code
2. **Token Storage**: Encrypt tokens before storing in database
3. **Rate Limiting**: ProductHunt API has rate limits - implement caching
4. **Error Handling**: Handle expired tokens, revoked access, etc.
5. **User Consent**: Always get user permission before accessing their data

## Testing

1. Test OAuth flow locally with `http://localhost:3000`
2. Update redirect URI in ProductHunt dashboard for production
3. Test token refresh mechanism
4. Test API calls with valid tokens

## Resources

- ProductHunt API Docs: https://api.producthunt.com/v2/docs
- GraphQL API: https://api.producthunt.com/v2/api/graphql
- OAuth Guide: Check ProductHunt's official documentation

