/**
 * Email templates for custom domain notifications
 */

interface DomainEmailData {
  userName: string;
  domain: string;
  verificationToken?: string;
  portfolioUrl?: string;
}

/**
 * Email when domain is added (with DNS instructions)
 */
export function domainAddedEmail(data: DomainEmailData): string {
  const { userName, domain, verificationToken } = data;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc';
  const appIP = process.env.APP_IP_ADDRESS || '216.198.79.1';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Domain Added</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Custom Domain Added! 🎉</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      You've successfully added <strong>${domain}</strong> as a custom domain for your portfolio!
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
      <h2 style="color: #f97316; margin-top: 0; font-size: 20px;">Next Steps: Configure DNS</h2>
      <p style="margin-bottom: 15px;">Add these DNS records at your domain provider:</p>
      
      <div style="background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; font-family: 'Courier New', monospace; font-size: 14px;">
        <strong style="color: #f97316;">Record 1: A Record</strong><br>
        Type: A<br>
        Name: @<br>
        Value: ${appIP}<br>
        TTL: 3600
      </div>
      
      <div style="background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; font-family: 'Courier New', monospace; font-size: 14px;">
        <strong style="color: #f97316;">Record 2: CNAME</strong><br>
        Type: CNAME<br>
        Name: www<br>
        Value: ${appDomain}<br>
        TTL: 3600
      </div>
      
      <div style="background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; font-family: 'Courier New', monospace; font-size: 14px;">
        <strong style="color: #f97316;">Record 3: TXT (Verification)</strong><br>
        Type: TXT<br>
        Name: _devfolio-verification<br>
        Value: ${verificationToken}<br>
        TTL: 3600
      </div>
    </div>
    
    <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>⏱️ Important:</strong> DNS propagation can take 5-10 minutes, but may take up to 24-48 hours in some cases.
      </p>
    </div>
    
    <p style="font-size: 16px; margin: 20px 0;">
      After adding the DNS records, return to your dashboard and click the "Verify Domain" button.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Go to Dashboard
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #6b7280;">
      Need help? Check out our <a href="https://${appDomain}/docs/custom-domain" style="color: #f97316;">custom domain guide</a> or reply to this email.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>DevFolio - Build Beautiful Developer Portfolios</p>
    <p>
      <a href="https://${appDomain}" style="color: #f97316; text-decoration: none;">Visit DevFolio</a> | 
      <a href="https://${appDomain}/support" style="color: #f97316; text-decoration: none;">Support</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email when domain is verified successfully
 */
export function domainVerifiedEmail(data: DomainEmailData): string {
  const { userName, domain, portfolioUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Domain Verified!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Domain Verified!</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! Your custom domain <strong>${domain}</strong> has been verified and is now live! 🚀
    </p>
    
    <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-size: 16px;">
        ✅ Your portfolio is now accessible at:
      </p>
      <p style="margin: 10px 0 0 0;">
        <a href="http://${domain}" style="color: #10b981; font-size: 18px; font-weight: bold; text-decoration: none;">
          ${domain}
        </a>
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="http://${domain}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
        View Your Portfolio
      </a>
      <a href="${portfolioUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Edit Portfolio
      </a>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #f97316; margin-top: 0;">What's Next?</h3>
      <ul style="color: #4b5563; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Share your new custom domain with employers and clients</li>
        <li style="margin-bottom: 10px;">Make sure SSL/HTTPS is enabled on your domain provider</li>
        <li style="margin-bottom: 10px;">Update your resume and social media with your new URL</li>
        <li style="margin-bottom: 10px;">Test your portfolio on different devices</li>
      </ul>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Congratulations on setting up your custom domain! Your portfolio just got a lot more professional. 💼
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>DevFolio - Build Beautiful Developer Portfolios</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email when domain verification fails after multiple attempts
 */
export function domainVerificationFailedEmail(data: DomainEmailData): string {
  const { userName, domain } = data;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Domain Verification Failed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Domain Verification Issue</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We've been trying to verify your custom domain <strong>${domain}</strong>, but we're having trouble finding the required DNS records.
    </p>
    
    <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        <strong>⚠️ Action Required:</strong> Please verify that you've added all the DNS records correctly.
      </p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #f97316; margin-top: 0;">Troubleshooting Steps:</h3>
      <ol style="color: #4b5563; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Double-check that all three DNS records are added correctly</li>
        <li style="margin-bottom: 10px;">Verify there are no typos in the record values</li>
        <li style="margin-bottom: 10px;">Make sure you're editing the correct domain at your registrar</li>
        <li style="margin-bottom: 10px;">Wait at least 24 hours for DNS propagation</li>
        <li style="margin-bottom: 10px;">Try using a DNS checker tool to verify your records</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View DNS Instructions
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      If you continue to have issues, please reply to this email or contact our support team. We're here to help! 💪
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>DevFolio - Build Beautiful Developer Portfolios</p>
    <p>
      <a href="https://${appDomain}/support" style="color: #f97316; text-decoration: none;">Contact Support</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

