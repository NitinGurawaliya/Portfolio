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
  const txtRecordName = `_devfolio-verification.${domain}`;
  console.log(`🔍 [DNS Verification] Checking TXT record: ${txtRecordName}`);
  console.log(`🔍 [DNS Verification] Expected token: ${expectedToken}`);
  
  try {
    const records = await dns.resolveTxt(txtRecordName);
    console.log(`✅ [DNS Verification] TXT records found:`, records);
    
    // records is array of arrays: [['token1'], ['token2']]
    const flatRecords = records.flat();
    console.log(`🔍 [DNS Verification] Flattened records:`, flatRecords);
    
    const found = flatRecords.includes(expectedToken);
    console.log(`🔍 [DNS Verification] Token match: ${found}`);
    
    return found;
  } catch (error: any) {
    console.error(`❌ [DNS Verification] TXT verification failed for ${txtRecordName}:`, {
      code: error?.code,
      errno: error?.errno,
      syscall: error?.syscall,
      hostname: error?.hostname,
      message: error?.message,
    });
    return false;
  }
}

/**
 * Check if domain A record points to our app
 * @param domain - The domain to check
 * @returns true if A record points to us
 */
/**
 * List of valid Vercel IP addresses (both old and new)
 * Vercel expanded their IP range, so we accept both for backward compatibility
 */
const VALID_VERCEL_IPS = [
  '76.76.21.21',      // Old Vercel IP (still works)
  '192.64.119.187',  // New Vercel IP (recommended)
  '216.198.79.1',    // Vercel edge IP (project-specific)
  '76.76.21.22',     // Additional Vercel IP (if any)
];

export async function checkDomainPointing(
  domain: string,
  storedIP?: string | null
): Promise<{ matches: boolean; actualIPs: string[] }> {
  // Support both old and new Vercel IPs for verification
  const expectedIP = storedIP || process.env.APP_IP_ADDRESS || '192.64.119.187';
  console.log(`🔍 [DNS Verification] Checking A record for: ${domain}`);
  console.log(`🔍 [DNS Verification] Stored IP from database: ${storedIP || 'none'}`);
  console.log(`🔍 [DNS Verification] Expected IP: ${expectedIP}`);
  console.log(`🔍 [DNS Verification] Valid Vercel IPs: ${VALID_VERCEL_IPS.join(', ')}`);
  
  try {
    const addresses = await dns.resolve4(domain);
    console.log(`✅ [DNS Verification] A record addresses found:`, addresses);
    
    // Check if IP matches any valid Vercel IP
    const matches = addresses.some(ip => VALID_VERCEL_IPS.includes(ip));
    console.log(`🔍 [DNS Verification] IP match: ${matches}`);
    
    if (!matches && addresses.length > 0) {
      console.warn(`⚠️ [DNS Verification] Domain points to: ${addresses.join(', ')}`);
      console.warn(`⚠️ [DNS Verification] Expected one of: ${VALID_VERCEL_IPS.join(', ')}`);
      console.warn(`⚠️ [DNS Verification] Domain may work but Vercel validation might fail`);
    }
    
    return { matches, actualIPs: addresses };
  } catch (error: any) {
    console.error(`❌ [DNS Verification] A record verification failed for ${domain}:`, {
      code: error?.code,
      errno: error?.errno,
      syscall: error?.syscall,
      hostname: error?.hostname,
      message: error?.message,
    });
    return { matches: false, actualIPs: [] };
  }
}

/**
 * Check if www subdomain CNAME points to our app
 */
export async function checkWWWPointing(domain: string): Promise<boolean> {
  const wwwDomain = `www.${domain}`;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc';
  console.log(`🔍 [DNS Verification] Checking CNAME for: ${wwwDomain}`);
  console.log(`🔍 [DNS Verification] Expected CNAME target: ${appDomain}`);
  
  try {
    const records = await dns.resolveCname(wwwDomain);
    console.log(`✅ [DNS Verification] CNAME records found:`, records);
    
    const matches = records.some(record => record.toLowerCase() === appDomain.toLowerCase());
    console.log(`🔍 [DNS Verification] CNAME match: ${matches}`);
    
    return matches;
  } catch (error: any) {
    console.error(`❌ [DNS Verification] CNAME verification failed for ${wwwDomain}:`, {
      code: error?.code,
      errno: error?.errno,
      syscall: error?.syscall,
      hostname: error?.hostname,
      message: error?.message,
    });
    return false;
  }
}

/**
 * Perform complete domain verification
 * Returns detailed status of all checks
 */
export async function verifyDomainComplete(
  domain: string,
  expectedToken: string,
  storedIP?: string | null
): Promise<{
  ownershipVerified: boolean;
  aRecordPointing: boolean;
  cnamePointing: boolean;
  allChecks: boolean;
  actualIPs: string[];
}> {
  console.log(`\n🚀 [DNS Verification] Starting complete verification for: ${domain}`);
  console.log(`🚀 [DNS Verification] Token: ${expectedToken}`);
  console.log(`🚀 [DNS Verification] Stored IP: ${storedIP || 'none'}\n`);
  
  const [ownershipVerified, aRecordResult, cnamePointing] = await Promise.all([
    verifyDomainOwnership(domain, expectedToken),
    checkDomainPointing(domain, storedIP),
    checkWWWPointing(domain),
  ]);

  const aRecordPointing = aRecordResult.matches;
  const allChecks = ownershipVerified && aRecordPointing;
  
  console.log(`\n📊 [DNS Verification] Verification Summary for ${domain}:`);
  console.log(`  ✓ Ownership (TXT): ${ownershipVerified ? '✅' : '❌'}`);
  console.log(`  ✓ A Record: ${aRecordPointing ? '✅' : '❌'}`);
  if (!aRecordPointing && aRecordResult.actualIPs.length > 0) {
    console.log(`  ⚠️  Actual A Record IPs: ${aRecordResult.actualIPs.join(', ')}`);
  }
  console.log(`  ✓ CNAME (www): ${cnamePointing ? '✅' : '❌'}`);
  console.log(`  ✓ All Checks Passed: ${allChecks ? '✅' : '❌'}\n`);

  return {
    ownershipVerified,
    aRecordPointing,
    cnamePointing,
    allChecks,
    actualIPs: aRecordResult.actualIPs,
  };
}

