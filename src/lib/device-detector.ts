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

