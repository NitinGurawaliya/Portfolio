export function detectDevice(userAgent: string): string {
  if (!userAgent) {
    console.log('🔍 Device Detection: No user agent, defaulting to Windows')
    return 'Windows'
  }
  
  const agent = userAgent.toLowerCase()
  
  // iPad needs to be checked before iPhone (iPad can contain iPhone in its UA)
  if (/ipad/i.test(agent)) {
    console.log('📱 Device Detected: iPad')
    return 'iPad'
  }
  
  // iPhone and iPod
  if (/iphone|ipod/i.test(agent)) {
    console.log('📱 Device Detected: iPhone/iPod')
    return 'iPhone'
  }
  
  // Android devices
  if (/android/i.test(agent)) {
    // Check for mobile-specific indicators
    if (/mobile/i.test(agent)) {
      console.log('📱 Device Detected: Android Mobile')
      return 'Android Mobile'
    }
    // If it's Android but not explicitly mobile, it's likely a tablet
    console.log('📱 Device Detected: Android Tablet')
    return 'Android Tablet'
  }
  
  // Other mobile devices
  if (/mobile|blackberry|iemobile|opera mini|windows phone/i.test(agent)) {
    console.log('📱 Device Detected: Mobile (Other)')
    return 'Mobile'
  }
  
  // Desktop OS
  if (/windows/i.test(agent)) {
    console.log('💻 Device Detected: Windows')
    return 'Windows'
  }
  if (/macintosh|mac os x|mac_powerpc/i.test(agent)) {
    console.log('💻 Device Detected: Mac')
    return 'Mac'
  }
  if (/linux/i.test(agent)) {
    console.log('💻 Device Detected: Linux')
    return 'Linux'
  }
  if (/ubuntu/i.test(agent)) {
    console.log('💻 Device Detected: Ubuntu')
    return 'Linux'
  }
  
  console.log('💻 Device Detected: Default (Windows)')
  return 'Windows' // Default to Windows as most common desktop OS
}

export function detectBrowser(userAgent: string, headers?: Headers): string {
  if (!userAgent) {
    console.log('🌐 Browser Detection: No user agent, defaulting to Chrome')
    return 'Chrome'
  }
  
  const agent = userAgent.toLowerCase()
  console.log('🌐 Browser Detection: Checking user agent:', userAgent.substring(0, 100))
  
  // Edge - Check FIRST as it contains Chrome in UA string
  // Edge has "Edg" in user agent (not "Edge")
  if (/edg/i.test(agent) && !/edgios|edga/i.test(agent)) {
    console.log('🌐 Browser Detected: Edge')
    return 'Edge'
  }
  
  // Opera - Check before Chrome
  // Opera has "OPR" or "Opera" in user agent
  if (/opr/i.test(agent) || /opera/i.test(agent)) {
    console.log('🌐 Browser Detected: Opera')
    return 'Opera'
  }
  
  // Vivaldi - Check before Chrome
  // Vivaldi has "Vivaldi" in user agent
  if (/vivaldi/i.test(agent)) {
    console.log('🌐 Browser Detected: Vivaldi')
    return 'Vivaldi'
  }
  
  // Brave - Check headers first for most accurate detection
  if (headers) {
    // Check sec-ch-ua header (most reliable for Brave)
    const secChUa = headers.get('sec-ch-ua') || ''
    if (/Brave/i.test(secChUa)) {
      console.log('🌐 Browser Detected: Brave (via sec-ch-ua header)')
      return 'Brave'
    }
    
    // Check for "brave" header (alternative method)
    if (headers.get('brave')) {
      console.log('🌐 Browser Detected: Brave (via brave header)')
      return 'Brave'
    }
  }
  
  // Brave fallback - Check user agent
  if (/brave/i.test(agent)) {
    console.log('🌐 Browser Detected: Brave (via user agent)')
    return 'Brave'
  }
  
  // Chrome - Only detect if none of the above matched
  if (/chrome/i.test(agent) && !/edg|opr|opera|vivaldi|brave/i.test(agent)) {
    console.log('🌐 Browser Detected: Chrome')
    return 'Chrome'
  }
  
  // Firefox
  if (/firefox/i.test(agent) && !/seamonkey/i.test(agent)) {
    console.log('🌐 Browser Detected: Firefox')
    return 'Firefox'
  }
  
  // Safari (should be last as many browsers include Safari in UA)
  if (/safari/i.test(agent) && !/chrome|firefox|edg|opr|opera|vivaldi|brave/i.test(agent)) {
    console.log('🌐 Browser Detected: Safari')
    return 'Safari'
  }
  
  // Internet Explorer
  if (/msie|trident/i.test(agent)) {
    console.log('🌐 Browser Detected: Internet Explorer')
    return 'IE'
  }
  
  // Samsung Internet
  if (/samsungbrowser/i.test(agent)) {
    console.log('🌐 Browser Detected: Samsung Internet')
    return 'Samsung'
  }
  
  console.log('🌐 Browser Detected: Default (Chrome)')
  return 'Chrome' // Default to Chrome as most common
}

/**
 * Detect if traffic might be from social media based on user agent and referrer
 */
export function detectSocialSource(userAgent: string, referrer: string): { source: string | null, confidence: 'high' | 'medium' } {
  const agent = userAgent.toLowerCase()
  const ref = referrer.toLowerCase()
  
  // High confidence: Direct social media referrers
  if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) {
    return { source: 'Twitter', confidence: 'high' }
  }
  
  if (ref.includes('linkedin.com') || ref.includes('lnkd.in')) {
    return { source: 'LinkedIn', confidence: 'high' }
  }
  
  if (ref.includes('facebook.com') || ref.includes('fb.com')) {
    return { source: 'Facebook', confidence: 'high' }
  }
  
  if (ref.includes('instagram.com')) {
    return { source: 'Instagram', confidence: 'high' }
  }
  
  // Medium confidence: Check user agent for social media bots/crawlers
  if (agent.includes('twitterbot')) {
    return { source: 'Twitter', confidence: 'medium' }
  }
  
  if (agent.includes('linkedinbot')) {
    return { source: 'LinkedIn', confidence: 'medium' }
  }
  
  if (agent.includes('facebookexternalhit')) {
    return { source: 'Facebook', confidence: 'medium' }
  }
  
  return { source: null, confidence: 'high' }
}

/**
 * Normalize referrer to show actual source platform
 * Handles cases like Twitter t.co links, LinkedIn lnkd.in links, etc.
 */
export function normalizeReferrer(referrer: string, socialInfo?: { source: string | null, confidence: 'high' | 'medium' }): string {
  if (!referrer || referrer === 'direct' || referrer === 'null') {
    return 'Direct'
  }
  
  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()
    
    // Use detected social source if available (highest priority)
    if (socialInfo?.source && socialInfo.confidence === 'high') {
      return socialInfo.source
    }
    
    // Handle self-referrals (when referrer is the portfolio itself)
    // This happens when social platforms strip the referrer
    if (hostname.includes('devfolio.cc') || hostname.includes('localhost')) {
      // Check if there's a social platform indicator in the URL path
      const path = url.pathname.toLowerCase()
      
      // If coming from / route or same path, it's likely a self-referral
      if (path.length < 10) {
        return 'Direct'
      }
      
      // Otherwise might be a redirect, keep as domain
      return 'Direct'
    }
    
    // Handle mobile app referrers
    if (referrer.includes('android-app://com.linkedin.android') || referrer.includes('ios-app://com.linkedin.LinkedIn')) {
      return 'LinkedIn'
    }
    
    if (referrer.includes('android-app://com.twitter.android') || referrer.includes('ios-app://com.atebits.Tweetie2')) {
      return 'Twitter'
    }
    
    if (referrer.includes('android-app://com.facebook.katana') || referrer.includes('ios-app://com.facebook.Facebook')) {
      return 'Facebook'
    }
    
    if (referrer.includes('android-app://com.whatsapp') || referrer.includes('ios-app://net.whatsapp.WhatsApp')) {
      return 'WhatsApp'
    }
    
    if (referrer.includes('android-app://com.instagram.android') || referrer.includes('ios-app://com.burbn.instagram')) {
      return 'Instagram'
    }
    
    if (referrer.includes('android-app://com.github.android') || referrer.includes('ios-app://com.github.ios')) {
      return 'GitHub'
    }
    
    // Handle shortened links and redirect domains
    if (hostname.includes('t.co') || hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'Twitter'
    }
    
    if (hostname.includes('linkedin.com') || hostname.includes('lnkd.in')) {
      return 'LinkedIn'
    }
    
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      return 'Facebook'
    }
    
    if (hostname.includes('instagram.com')) {
      return 'Instagram'
    }
    
    if (hostname.includes('whatsapp.com') || hostname.includes('wa.me')) {
      return 'WhatsApp'
    }
    
    // Check for UTM parameters
    const utmSource = url.searchParams.get('utm_source')
    if (utmSource) {
      // Capitalize first letter of each word
      return utmSource
        .split(/[-_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
    
    if (hostname.includes('reddit.com')) {
      return 'Reddit'
    }
    
    if (hostname.includes('github.com')) {
      return 'GitHub'
    }
    
    if (hostname.includes('dev.to') || hostname.includes('devto')) {
      return 'Dev.to'
    }
    
    if (hostname.includes('medium.com')) {
      return 'Medium'
    }
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'YouTube'
    }
    
    if (hostname.includes('stackoverflow.com') || hostname.includes('stackexchange.com')) {
      return 'StackOverflow'
    }
    
    // Return clean domain name
    return hostname.replace('www.', '')
  } catch (error) {
    // If URL parsing fails, return as is
    return referrer
  }
}

