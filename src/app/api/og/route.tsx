import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const revalidate = 60 // Revalidate every minute

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get parameters from URL
    const username = searchParams.get('username') || 'developer'
    const displayName = searchParams.get('displayName') || username
    const jobTitle = searchParams.get('jobTitle') || 'Developer'
    const bio = searchParams.get('bio') || 'Check out my developer portfolio'
    const profilePic = searchParams.get('profilePic') || ''

    console.log('OG Portfolio Image Request:', { username, displayName, jobTitle })

    // Fetch profile image if provided
    let profileImageData = null
    if (profilePic && profilePic.startsWith('http')) {
      try {
        const imageResponse = await fetch(profilePic)
        profileImageData = await imageResponse.arrayBuffer()
      } catch (err) {
        console.log('Failed to fetch profile image:', err)
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000000',
            backgroundImage: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Grid Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.06) 0%, transparent 50%)
              `,
              backgroundSize: '40px 40px, 40px 40px, 100% 100%, 100% 100%',
            }}
          />

          {/* Header - DevFolio Branding */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #ea580c, #c2410c)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DevFolio
            </div>
          </div>

          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '80px 60px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Profile Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '50px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '50px 60px',
                maxWidth: '1000px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Profile Image */}
              <div
                style={{
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                {profileImageData ? (
                  <img
                    // @ts-ignore
                    src={profileImageData}
                    alt={displayName}
                    style={{
                      width: '180px',
                      height: '180px',
                      borderRadius: '90px',
                      border: '4px solid rgba(249, 115, 22, 0.5)',
                      boxShadow: '0 0 40px rgba(249, 115, 22, 0.3)',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '180px',
                      height: '180px',
                      borderRadius: '90px',
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '72px',
                      fontWeight: 'bold',
                      color: '#000000',
                      border: '4px solid rgba(249, 115, 22, 0.5)',
                      boxShadow: '0 0 40px rgba(249, 115, 22, 0.3)',
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  flex: 1,
                }}
              >
                {/* Display Name */}
                <div
                  style={{
                    fontSize: '52px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {displayName}
                </div>

                {/* Job Title */}
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: '500',
                    background: 'linear-gradient(to right, #f97316, #ea580c)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                  }}
                >
                  {jobTitle}
                </div>

                {/* Bio */}
                <div
                  style={{
                    fontSize: '20px',
                    color: '#a3a3a3',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {bio}
                </div>

                {/* Username Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '8px',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(249, 115, 22, 0.1)',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      borderRadius: '20px',
                      fontSize: '16px',
                      color: '#f97316',
                      fontWeight: '500',
                    }}
                  >
                    devfolio.cc/{username}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right - Powered by */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              color: '#737373',
            }}
          >
            <span>Powered by</span>
            <span
              style={{
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #ea580c, #c2410c)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DevFolio
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('OG Portfolio Image Generation Error:', e)
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
