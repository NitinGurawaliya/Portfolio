/**
 * DNS Configuration Generator
 * Generates DNS records for custom domain setup
 */

import { getVercelRecommendedIP } from './vercel-api';

export interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  ttl: number;
}

export interface DNSRecordSet {
  apex: DNSRecord;
  www: DNSRecord;
  verification: DNSRecord;
}

/**
 * Get the recommended IP address for A records
 * Priority: APP_IP_ADDRESS env var > Vercel API > Default fallback
 */
async function getRecommendedIP(): Promise<string> {
  // First, check env var (highest priority)
  if (process.env.APP_IP_ADDRESS) {
    return process.env.APP_IP_ADDRESS;
  }

  // Try to get from Vercel API
  const vercelIP = await getVercelRecommendedIP();
  if (vercelIP.success && vercelIP.ip) {
    return vercelIP.ip;
  }

  // Fallback to Vercel's standard IP
  // This is the IP Vercel typically provides when adding domains
  return '76.76.21.21';
}

/**
 * Generate DNS records for a custom domain
 * @param domain - The custom domain (e.g., "nitin.com")
 * @param verificationToken - The verification token for TXT record
 * @param vercelIP - Optional IP address from Vercel (preferred)
 * @returns DNS records that the user needs to add
 */
export async function generateDNSRecords(
  domain: string,
  verificationToken: string,
  vercelIP?: string | null
): Promise<DNSRecordSet> {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc';
  
  // Priority: Use IP from Vercel > env var > API > default
  let appIP: string;
  if (vercelIP) {
    // Use IP provided by Vercel (most accurate)
    appIP = vercelIP;
    console.log(`[DNS Config] Using Vercel-provided IP: ${appIP}`);
  } else {
    // Fallback to dynamic lookup
    appIP = await getRecommendedIP();
    console.log(`[DNS Config] Using fallback IP: ${appIP}`);
  }

  return {
    // For apex domain (nitin.com)
    apex: {
      type: 'A',
      name: '@',
      value: appIP,
      ttl: 3600,
    },
    // For www subdomain (www.nitin.com)
    www: {
      type: 'CNAME',
      name: 'www',
      value: appDomain,
      ttl: 3600,
    },
    // Verification record (proves domain ownership)
    verification: {
      type: 'TXT',
      name: '_devfolio-verification',
      value: verificationToken,
      ttl: 3600,
    },
  };
}

/**
 * Format DNS records for display to user
 */
export function formatDNSRecordsForDisplay(records: DNSRecordSet): string {
  return `
Add these records at your domain provider:

Record 1 (Required for apex domain):
Type: ${records.apex.type}
Name: ${records.apex.name}
Value: ${records.apex.value}
TTL: ${records.apex.ttl}

Record 2 (Required for www):
Type: ${records.www.type}
Name: ${records.www.name}
Value: ${records.www.value}
TTL: ${records.www.ttl}

Record 3 (Verification - temporary):
Type: ${records.verification.type}
Name: ${records.verification.name}
Value: ${records.verification.value}
TTL: ${records.verification.ttl}

After adding these records:
1. Wait 5-10 minutes for DNS propagation
2. Click "Verify Domain" button
3. Once verified, your portfolio will be live at ${records.apex.name === '@' ? 'your domain' : records.apex.name}
  `.trim();
}

