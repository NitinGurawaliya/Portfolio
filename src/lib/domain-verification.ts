/**
 * Domain Verification Service
 * Handles DNS verification for custom domains
 */

import dns from 'dns/promises';

/**
 * Verify domain ownership via TXT record
 * @param domain - The domain to verify
 * @param expectedToken - The expected verification token
 * @returns true if verification succeeds
 */
export async function verifyDomainOwnership(
  domain: string,
  expectedToken: string
): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(`_devfolio-verification.${domain}`);
    
    // records is array of arrays: [['token1'], ['token2']]
    const flatRecords = records.flat();
    
    return flatRecords.includes(expectedToken);
  } catch (error) {
    console.error('DNS TXT verification failed:', error);
    return false;
  }
}

/**
 * Check if domain A record points to our app
 * @param domain - The domain to check
 * @returns true if A record points to us
 */
export async function checkDomainPointing(domain: string): Promise<boolean> {
  try {
    const addresses = await dns.resolve4(domain);
    const expectedIP = process.env.APP_IP_ADDRESS || '76.76.21.21';
    
    return addresses.includes(expectedIP);
  } catch (error) {
    console.error('A record verification failed:', error);
    return false;
  }
}

/**
 * Check if www subdomain CNAME points to our app
 */
export async function checkWWWPointing(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveCname(`www.${domain}`);
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc';
    
    return records.some(record => record.toLowerCase() === appDomain.toLowerCase());
  } catch (error) {
    console.error('CNAME verification failed:', error);
    return false;
  }
}

/**
 * Perform complete domain verification
 * Returns detailed status of all checks
 */
export async function verifyDomainComplete(
  domain: string,
  expectedToken: string
): Promise<{
  ownershipVerified: boolean;
  aRecordPointing: boolean;
  cnamePointing: boolean;
  allChecks: boolean;
}> {
  const [ownershipVerified, aRecordPointing, cnamePointing] = await Promise.all([
    verifyDomainOwnership(domain, expectedToken),
    checkDomainPointing(domain),
    checkWWWPointing(domain),
  ]);

  return {
    ownershipVerified,
    aRecordPointing,
    cnamePointing,
    allChecks: ownershipVerified && aRecordPointing,
  };
}

