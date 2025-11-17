import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const revalidate = 60 // Revalidate every minute

export async function GET(request: NextRequest) {
  try {
    console.log('OG Landing Image Request:', { url: request.url })
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
                radial-gradient(circle at 30% 40%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(249, 115, 22, 0.06) 0%, transparent 50%)
              `,
              backgroundSize: '50px 50px, 50px 50px, 100% 100%, 100% 100%',
            }}
          />

          {/* Header - DevFolio Logo */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '50px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '32px',
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

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 60px',
              maxWidth: '900px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                marginBottom: '40px',
                fontSize: '16px',
                color: '#e5e5e5',
              }}
            >
              <span style={{ marginRight: '8px' }}>🔥</span>
              <span>Free right now - grab it while it's hot</span>
            </div>

            {/* Main Heading */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '50px',
              }}
            >
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  margin: '0 0 10px 0',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Create stunning portfolios
              </h1>
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  margin: '0',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#ffffff', marginRight: '16px' }}>from your</span>
                <span
                  style={{
                    background: 'linear-gradient(to right, #f97316, #ea580c)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  GitHub profile
                </span>
              </h1>
            </div>

            {/* CTA Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '18px 36px',
                backgroundColor: '#f97316',
                borderRadius: '10px',
                fontSize: '22px',
                fontWeight: '600',
                color: '#000000',
                boxShadow: '0 10px 40px rgba(249, 115, 22, 0.3)',
                marginBottom: '50px',
              }}
            >
              <span>Let's Do This</span>
            </div>

            {/* Bottom Text */}
            <div
              style={{
                fontSize: '16px',
                color: '#737373',
              }}
            >
              Used by devs who actually ship stuff
            </div>
          </div>

          {/* Bottom Right - Domain */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '50px',
              fontSize: '16px',
              color: '#737373',
            }}
          >
            devfolio.cc
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('OG Landing Image Generation Error:', e)
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
