import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const imageUrl = searchParams.get('url')
    const username = searchParams.get('username') || 'user'

    console.log('Favicon Request:', { imageUrl, username })

    // If no image URL provided, return default favicon
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.log('No valid image URL, redirecting to default favicon')
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/favicon-d.svg',
        },
      })
    }

    // Fetch the profile image
    let profileImageData = null
    try {
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DevFolio-Favicon/1.0)',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
      
      if (imageResponse.ok && imageResponse.headers.get('content-type')?.startsWith('image/')) {
        profileImageData = await imageResponse.arrayBuffer()
        console.log('Successfully fetched profile image for favicon')
      } else {
        console.log('Invalid response for profile image:', imageResponse.status, imageResponse.statusText)
      }
    } catch (err) {
      console.log('Failed to fetch profile image for favicon:', err)
    }

    // If we couldn't fetch the image, return default favicon
    if (!profileImageData) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/favicon-d.svg',
        },
      })
    }

    // Generate favicon from profile image
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            borderRadius: '50%',
          }}
        >
          <img
            // @ts-ignore
            src={profileImageData}
            alt={username}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </div>
      ),
      {
        width: 32,
        height: 32,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300, must-revalidate',
        },
      }
    )
  } catch (e: any) {
    console.error('Favicon Generation Error:', e)
    // Return a proper error response with fallback
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/favicon-d.svg',
        'Cache-Control': 'public, max-age=300, must-revalidate',
      },
    })
  }
}
