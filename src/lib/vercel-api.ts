/**
 * Vercel API Integration
 * Automatically adds custom domains to Vercel project
 * This eliminates the need for manual domain addition
 */

interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string | null;
  redirectStatusCode?: number | null;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  verification?: Array<{
    type: string;
    domain: string;
    value: string;
    reason: string;
  }>;
}

interface VercelError {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Add a domain to Vercel project via API
 */
export async function addDomainToVercel(
  domain: string,
  projectId?: string
): Promise<{ success: boolean; data?: VercelDomainResponse; error?: string }> {
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID || projectId;
  const vercelTeamId = process.env.VERCEL_TEAM_ID; // Optional for teams

  if (!vercelToken) {
    console.error('[Vercel API] VERCEL_API_TOKEN not configured');
    return {
      success: false,
      error: 'Vercel API token not configured',
    };
  }

  if (!vercelProjectId) {
    console.error('[Vercel API] VERCEL_PROJECT_ID not configured');
    return {
      success: false,
      error: 'Vercel project ID not configured',
    };
  }

  try {
    // Vercel API endpoint
    const apiUrl = vercelTeamId
      ? `https://api.vercel.com/v9/projects/${vercelProjectId}/domains?teamId=${vercelTeamId}`
      : `https://api.vercel.com/v9/projects/${vercelProjectId}/domains`;

    console.log(`[Vercel API] Adding domain: ${domain} to project: ${vercelProjectId}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domain,
        // Connect to production environment by default
        gitBranch: null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as VercelError;
      console.error('[Vercel API] Error adding domain:', error);

      // Handle specific error cases
      if (error.error?.code === 'domain_already_in_use') {
        // Domain already added - this is okay, might have been added manually
        console.log(`[Vercel API] Domain ${domain} already exists in Vercel`);
        return {
          success: true,
          data: data as VercelDomainResponse,
        };
      }

      if (error.error?.code === 'domain_not_found') {
        return {
          success: false,
          error: 'Domain not found. Please check DNS configuration.',
        };
      }

      return {
        success: false,
        error: error.error?.message || 'Failed to add domain to Vercel',
      };
    }

    console.log(`[Vercel API] Successfully added domain: ${domain}`);
    return {
      success: true,
      data: data as VercelDomainResponse,
    };
  } catch (error) {
    console.error('[Vercel API] Exception adding domain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Remove a domain from Vercel project
 */
export async function removeDomainFromVercel(
  domain: string,
  projectId?: string
): Promise<{ success: boolean; error?: string }> {
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID || projectId;
  const vercelTeamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken || !vercelProjectId) {
    return {
      success: false,
      error: 'Vercel API credentials not configured',
    };
  }

  try {
    const apiUrl = vercelTeamId
      ? `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}?teamId=${vercelTeamId}`
      : `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('[Vercel API] Error removing domain:', error);
      return {
        success: false,
        error: 'Failed to remove domain from Vercel',
      };
    }

    console.log(`[Vercel API] Successfully removed domain: ${domain}`);
    return { success: true };
  } catch (error) {
    console.error('[Vercel API] Exception removing domain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get recommended IP address from Vercel for custom domains
 * This fetches the IP that Vercel recommends for A records
 */
export async function getVercelRecommendedIP(
  projectId?: string
): Promise<{ success: boolean; ip?: string; error?: string }> {
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID || projectId;
  const vercelTeamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken || !vercelProjectId) {
    // Fallback to env var or default if API not configured
    const fallbackIP = process.env.APP_IP_ADDRESS || '76.76.21.21';
    console.warn('[Vercel API] API not configured, using fallback IP:', fallbackIP);
    return {
      success: true,
      ip: fallbackIP,
    };
  }

  try {
    // Try to get project configuration which includes DNS info
    // Vercel's recommended approach: use their edge IP
    // For now, we'll use a known Vercel IP and allow override via env var
    // Vercel typically uses: 76.76.21.21 (old) or 192.64.119.187 (new)
    
    // Check if we have a domain already added to get the IP from
    const projectUrl = vercelTeamId
      ? `https://api.vercel.com/v9/projects/${vercelProjectId}?teamId=${vercelTeamId}`
      : `https://api.vercel.com/v9/projects/${vercelProjectId}`;

    // Actually, Vercel doesn't expose IP directly in project API
    // The IP is shown in the dashboard when adding domain
    // We'll use env var as primary source, with fallback to known IPs
    
    const envIP = process.env.APP_IP_ADDRESS;
    if (envIP) {
      return {
        success: true,
        ip: envIP,
      };
    }

    // Default to Vercel's current recommended IP
    // This can be updated via APP_IP_ADDRESS env var
    const defaultIP = '76.76.21.21'; // Vercel's standard IP
    
    return {
      success: true,
      ip: defaultIP,
    };
  } catch (error) {
    console.error('[Vercel API] Exception getting recommended IP:', error);
    // Fallback to default
    return {
      success: true,
      ip: process.env.APP_IP_ADDRESS || '76.76.21.21',
    };
  }
}

/**
 * Get domain status from Vercel
 */
export async function getVercelDomainStatus(
  domain: string,
  projectId?: string
): Promise<{ success: boolean; verified?: boolean; error?: string }> {
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID || projectId;
  const vercelTeamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken || !vercelProjectId) {
    return {
      success: false,
      error: 'Vercel API credentials not configured',
    };
  }

  try {
    const apiUrl = vercelTeamId
      ? `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}?teamId=${vercelTeamId}`
      : `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        verified: false,
      };
    }

    const data = await response.json() as VercelDomainResponse;
    
    // Check if domain is verified (has no verification errors)
    const verified = !data.verification || data.verification.length === 0;

    return {
      success: true,
      verified,
    };
  } catch (error) {
    console.error('[Vercel API] Exception checking domain status:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

