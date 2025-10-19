import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Cache the OG images for better performance
export const revalidate = 3600 // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const displayName = searchParams.get('displayName') || username
    const jobTitle = searchParams.get('jobTitle') || 'Developer'
    const bio = searchParams.get('bio') || `Check out ${displayName}'s developer portfolio`
    const profilePic = searchParams.get('profilePic') || 'https://github.com/github.png'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'linear-gradient(45deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, rgba(249, 115, 22, 0.05) 0%, transparent 50%)
              `,
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              maxWidth: '900px',
              textAlign: 'center',
            }}
          >
            {/* Profile Picture with DevFolio Badge */}
            <div
              style={{
                position: 'relative',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '60px',
                  border: '4px solid #f97316',
                  backgroundImage: `url(${profilePic})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* DevFolio Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '-8px',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f97316',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#000000',
                  border: '3px solid #000000',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                D
              </div>
            </div>

            {/* Name */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 10px 0',
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </h1>

            {/* Job Title */}
            <div
              style={{
                fontSize: '24px',
                color: '#f97316',
                fontWeight: '600',
                marginBottom: '20px',
              }}
            >
              {jobTitle}
            </div>

            {/* Bio */}
            <div
              style={{
                fontSize: '20px',
                color: '#e5e5e5',
                lineHeight: 1.4,
                marginBottom: '40px',
                maxWidth: '600px',
              }}
            >
              {bio}
            </div>

            {/* DevFolio Branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 32px',
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                border: '2px solid rgba(249, 115, 22, 0.4)',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#f97316',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                D
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#f97316',
                }}
              >
                DevFolio
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#e5e5e5',
                  fontWeight: '500',
                }}
              >
                Portfolio Builder
              </div>
            </div>
          </div>

          {/* Bottom Right Logo */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#f97316',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#000000',
              }}
            >
              D
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#a3a3a3',
                fontWeight: '500',
              }}
            >
              devfolio.cc
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
