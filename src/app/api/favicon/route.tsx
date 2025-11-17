import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const revalidate = 0 // Don't cache - always fetch fresh favicon

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

    // Fetch the profile image with retry logic
    let profileImageData = null
    const fetchImageWithRetry = async (url: string, retries = 3): Promise<ArrayBuffer | null> => {
      for (let i = 0; i < retries; i++) {
        try {
          const imageResponse = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; DevFolio-Favicon/1.0)',
              'Accept': 'image/*',
            },
            signal: AbortSignal.timeout(8000), // 8 second timeout
          })
          
          if (imageResponse.ok) {
            const contentType = imageResponse.headers.get('content-type')
            if (contentType && contentType.startsWith('image/')) {
              const buffer = await imageResponse.arrayBuffer()
              console.log(`✅ Successfully fetched profile image for favicon (attempt ${i + 1})`)
              return buffer
            } else {
              console.log(`⚠️ Invalid content-type for image: ${contentType}`)
            }
          } else {
            console.log(`⚠️ Image fetch failed: ${imageResponse.status} ${imageResponse.statusText} (attempt ${i + 1})`)
          }
        } catch (err) {
          console.log(`⚠️ Failed to fetch profile image (attempt ${i + 1}):`, err)
          if (i < retries - 1) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
          }
        }
      }
      return null
    }

    profileImageData = await fetchImageWithRetry(imageUrl)

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
          'Cache-Control': 'public, max-age=0, must-revalidate, no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
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
