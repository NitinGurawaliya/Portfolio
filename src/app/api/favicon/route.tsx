import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const revalidate = 60 // Cache for 1 minute

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
      const imageResponse = await fetch(imageUrl)
      if (imageResponse.ok) {
        profileImageData = await imageResponse.arrayBuffer()
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
      }
    )
  } catch (e: any) {
    console.error('Favicon Generation Error:', e)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/favicon-d.svg',
      },
    })
  }
}
