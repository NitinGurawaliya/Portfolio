/**
 * DNS Configuration Generator
 * Generates DNS records for custom domain setup
 */

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
 * Generate DNS records for a custom domain
 * @param domain - The custom domain (e.g., "nitin.com")
 * @param verificationToken - The verification token for TXT record
 * @returns DNS records that the user needs to add
 */
export function generateDNSRecords(
  domain: string,
  verificationToken: string
): DNSRecordSet {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc';
  const appIP = process.env.APP_IP_ADDRESS || '76.76.21.21';

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

