import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
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
            backgroundImage: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
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
                radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.05) 0%, transparent 70%)
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
              padding: '60px 40px',
              maxWidth: '1000px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* DevFolio Logo */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '24px',
                backgroundColor: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
                boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#000000',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                D
              </div>
            </div>

            {/* Main Title */}
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 20px 0',
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #ffffff 0%, #f97316 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DevFolio
            </h1>

            {/* Subtitle */}
            <div
              style={{
                fontSize: '28px',
                color: '#e5e5e5',
                fontWeight: '500',
                marginBottom: '30px',
                maxWidth: '600px',
              }}
            >
              Create Your Developer Portfolio in Minutes
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '20px',
                color: '#a3a3a3',
                lineHeight: 1.4,
                marginBottom: '40px',
                maxWidth: '700px',
              }}
            >
              Connect your GitHub, pick a theme, and share your stunning portfolio with the world. No coding required.
            </div>

            {/* Feature Pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '40px',
              }}
            >
              {['GitHub Integration', 'Multiple Themes', 'SEO Optimized', 'Mobile Ready'].map((feature, index) => (
                <div
                  key={index}
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
                  {feature}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div
              style={{
                padding: '16px 32px',
                backgroundColor: '#f97316',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#000000',
                boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)',
              }}
            >
              Get Started Free
            </div>
          </div>

          {/* Bottom Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: '#a3a3a3',
                fontWeight: '500',
              }}
            >
              devfolio.cc
            </div>
          </div>

          {/* Corner Accent */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              width: '60px',
              height: '60px',
              border: '2px solid rgba(249, 115, 22, 0.3)',
              borderTop: '2px solid #f97316',
              borderLeft: '2px solid #f97316',
              borderRadius: '12px',
            }}
          />
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
