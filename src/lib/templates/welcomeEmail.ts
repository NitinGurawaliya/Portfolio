interface WelcomeEmailData {
  name: string;
  username?: string;
  portfolioUrl?: string;
}

export interface PortfolioPublishedEmailData {
  name: string;
  username: string;
  portfolioUrl: string;
  customUsername?: string;
}

export const generateWelcomeEmail = (data: WelcomeEmailData): string => {
  const { name, username, portfolioUrl } = data;
  const displayName = name || username || 'Developer';
  const portfolioLink = portfolioUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://devfolio.com';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to DevFolio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa; color: #0a0a0a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px 32px 32px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.5px;">
                                Welcome to DevFolio 👋
                            </h1>
                            <p style="margin: 12px 0 0; font-size: 15px; color: #737373; line-height: 1.5;">
                                Let's build something awesome together
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #0a0a0a;">
                                Hey ${displayName},
                            </p>
                            
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #404040;">
                                You just signed up for DevFolio. Here's what you can do now:
                            </p>
                            
                            <!-- Features -->
                            <div style="margin: 0 0 32px; padding: 24px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e5e5e5;">
                                <div style="margin-bottom: 20px;">
                                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #0a0a0a;">
                                        ✓ Import GitHub repos automatically
                                    </p>
                                    <p style="margin: 0; font-size: 14px; color: #737373; line-height: 1.6;">
                                        One click and all your projects are synced
                                    </p>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #0a0a0a;">
                                        ✓ Pick a theme that fits your vibe
                                    </p>
                                    <p style="margin: 0; font-size: 14px; color: #737373; line-height: 1.6;">
                                        Clean designs that actually look good
                                    </p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #0a0a0a;">
                                        ✓ Get your own custom URL
                                    </p>
                                    <p style="margin: 0; font-size: 14px; color: #737373; line-height: 1.6;">
                                        Share it anywhere, anytime
                                    </p>
                                </div>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; margin: 0 0 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="${portfolioLink}/dashboard" 
                                           style="display: inline-block; padding: 14px 28px; background-color: #ea580c; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
                                            Go to Dashboard →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="padding: 20px; background-color: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 6px; margin: 0 0 28px;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #78350f;">
                                    <strong>Quick tip:</strong> Set up your custom URL first. Makes sharing way easier later.
                                </p>
                            </div>
                            
                            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #404040;">
                                That's it. Go build something cool.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px; background-color: #fafafa; text-align: center; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0 0 16px; font-size: 13px; color: #737373;">
                                Questions? Just reply to this email.
                            </p>
                            
                            <p style="margin: 0; font-size: 12px; color: #a3a3a3; line-height: 1.6;">
                                © ${new Date().getFullYear()} DevFolio<br>
                                You got this email because you signed up
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();
};

export const generatePortfolioPublishedEmail = (data: PortfolioPublishedEmailData): string => {
  const { name, username, portfolioUrl, customUsername } = data;
  const displayName = name || username;
  const shareUrl = customUsername 
    ? `${portfolioUrl}/portfolio/${customUsername}`
    : `${portfolioUrl}/${username}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Portfolio is Live!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa; color: #0a0a0a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px 32px 32px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.5px;">
                                Your Portfolio is Live
                            </h1>
                            <p style="margin: 12px 0 0; font-size: 15px; color: #737373; line-height: 1.5;">
                                Time to share it with the world
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #0a0a0a;">
                                Hey ${displayName},
                            </p>
                            
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #404040;">
                                Your portfolio just went live. Here's your link:
                            </p>
                            
                            <!-- URL Box -->
                            <div style="margin: 0 0 32px; padding: 20px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e5e5e5; text-align: center;">
                                <a href="${shareUrl}" style="font-size: 16px; font-weight: 600; color: #ea580c; text-decoration: none; word-break: break-all;">
                                    ${shareUrl}
                                </a>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #404040;">
                                What to do next:
                            </p>
                            
                            <!-- Next Steps -->
                            <div style="margin: 0 0 32px; padding: 24px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e5e5e5;">
                                <div style="margin-bottom: 20px;">
                                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #0a0a0a;">
                                        Share it on LinkedIn
                                    </p>
                                    <p style="margin: 0; font-size: 14px; color: #737373; line-height: 1.6;">
                                        Add it to your profile. Recruiters will see it.
                                    </p>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #0a0a0a;">
                                        Put it in your GitHub bio
                                    </p>
                                    <p style="margin: 0; font-size: 14px; color: #737373; line-height: 1.6;">
                                        Link it in your profile. More visibility.
                                    </p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #0a0a0a;">
                                        Add to your resume/CV
                                    </p>
                                    <p style="margin: 0; font-size: 14px; color: #737373; line-height: 1.6;">
                                        Shows you actually build stuff.
                                    </p>
                                </div>
                            </div>
                            
                            <!-- CTA Buttons -->
                            <table role="presentation" style="width: 100%; margin: 0 0 28px;">
                                <tr>
                                    <td align="center">
                                        <a href="${shareUrl}" 
                                           style="display: inline-block; padding: 14px 28px; background-color: #ea580c; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; margin-right: 12px;">
                                            View Portfolio →
                                        </a>
                                        <a href="${portfolioUrl}/dashboard" 
                                           style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #0a0a0a; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; border: 1px solid #e5e5e5;">
                                            Edit Portfolio
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="padding: 20px; background-color: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 6px; margin: 0 0 28px;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #78350f;">
                                    <strong>Pro tip:</strong> Keep your portfolio updated. Add new projects as you build them.
                                </p>
                            </div>
                            
                            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #404040;">
                                Nice work getting this live.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px; background-color: #fafafa; text-align: center; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0 0 16px; font-size: 13px; color: #737373;">
                                Questions? Just reply to this email.
                            </p>
                            
                            <p style="margin: 0; font-size: 12px; color: #a3a3a3; line-height: 1.6;">
                                © ${new Date().getFullYear()} DevFolio<br>
                                You got this because you published your portfolio
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();
};

