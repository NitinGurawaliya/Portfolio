import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/services/email';
import { emailLogger } from '@/lib/constants/emailLogger';

/**
 * Test API Route for Email Service
 * 
 * Usage:
 * POST /api/email/test
 * Body: {
 *   "email": "test@example.com",
 *   "name": "Test User",
 *   "id": "123"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, id } = body;

    // Validation
    if (!email || !name || !id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: email, name, id',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    console.log('📧 Testing welcome email for:', email);

    // Send welcome email
    const result = await sendWelcomeEmail({
      email,
      name,
      id,
    });

    console.log('✅ Email test result:', result);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        requestId: result.requestId,
        error: result.error,
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error: any) {
    console.error('❌ Email test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test email',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check email service configuration
 */
export async function GET() {
  const config = {
    hasEmailServiceUrl: !!process.env.EMAIL_SERVICE_URL,
    hasEmailApiKey: !!process.env.EMAIL_API_KEY,
    hasFromEmail: !!process.env.FROM_EMAIL,
    emailServiceUrl: process.env.EMAIL_SERVICE_URL
      ? process.env.EMAIL_SERVICE_URL.substring(0, 20) + '...'
      : 'Not configured',
    fromEmail: process.env.FROM_EMAIL || 'Not configured',
  };

  // Get email metrics
  const metrics = emailLogger.getMetrics();

  return NextResponse.json({
    success: true,
    message: 'Email service configuration',
    configuration: config,
    metrics: {
      totalRequests: metrics.totalRequests,
      successCount: metrics.successCount,
      failureCount: metrics.failureCount,
      averageDuration: metrics.averageDuration.toFixed(2) + 'ms',
      errorsByType: metrics.errorsByType,
    },
    ready:
      config.hasEmailServiceUrl &&
      config.hasEmailApiKey &&
      config.hasFromEmail,
  });
}

