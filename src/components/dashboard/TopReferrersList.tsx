"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

interface Referrer {
  referrer: string
  count: number
}

interface TopReferrersListProps {
  referrers: Referrer[]
}

// Function to get referrer icon
function getReferrerIcon(referrer: string) {
  const refLower = referrer.toLowerCase()
  
  // Google
  if (refLower.includes('google')) {
    return <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    </div>
  }
  
  // Twitter/X
  if (refLower.includes('twitter')) {
    return <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </div>
  }
  
  // LinkedIn
  if (refLower.includes('linkedin')) {
    return <div className="w-7 h-7 rounded-full bg-[#0077b5] flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </div>
  }
  
  // Facebook
  if (refLower.includes('facebook')) {
    return <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </div>
  }
  
  // Instagram
  if (refLower.includes('instagram')) {
    return <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </div>
  }
  
  // WhatsApp
  if (refLower.includes('whatsapp') || refLower.includes('wa.me')) {
    return <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </div>
  }
  
  // GitHub
  if (refLower.includes('github')) {
    return <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    </div>
  }
  
  // Reddit
  if (refLower.includes('reddit')) {
    return <div className="w-7 h-7 rounded-full bg-[#FF4500] flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
      </svg>
    </div>
  }
  
  // YouTube
  if (refLower.includes('youtube')) {
    return <div className="w-7 h-7 rounded-full bg-[#FF0000] flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    </div>
  }
  
  // Dev.to
  if (refLower.includes('dev.to') || refLower.includes('devto')) {
    return <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
      <span className="text-white font-bold text-xs">DEV</span>
    </div>
  }
  
  // Medium
  if (refLower.includes('medium')) {
    return <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
        <path d="M13.54 12l-5.28-3.03L2.46 4l-.72.83L7.26 12l-5.52 7.17.72.83 5.8-4.97L13.54 12zm2.39 0l5.8 4.97.72-.83L16.74 12l5.71-7.17-.72-.83-5.8 4.97L15.93 12z"/>
      </svg>
    </div>
  }
  
  // Stack Overflow
  if (refLower.includes('stackoverflow') || refLower.includes('stackexchange')) {
    return <div className="w-7 h-7 rounded-full bg-[#F48024] flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 19.731H16.85v-2.137H6.111v2.137zm.259-4.852l10.48 2.189.451-2.07-10.478-2.317-.453 2.198zm1.359-5.056l9.705 4.53.903-1.95-9.706-4.53-.902 1.949zm2.315-4.785l8.217 6.855 1.359-1.62-8.216-6.853-1.35 1.617zm4.527-4.801l-1.746 1.293 6.622 8.98 1.746-1.292-6.622-8.981z"/>
      </svg>
    </div>
  }
  
  // Default icon
  return <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
    <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
  </div>
}

export function TopReferrersList({ referrers }: TopReferrersListProps) {
  const getDomainName = (referrer: string) => {
    const lowerRef = referrer.toLowerCase()
    
    if (lowerRef === 'direct') return 'direct'
    
    try {
      if (lowerRef.includes('http')) {
        const url = new URL(referrer)
        return url.hostname.replace('www.', '')
      }
      return referrer.replace('www.', '')
    } catch {
      return referrer
    }
  }

  return (
    <Card className="border border-gray-200 shadow-none bg-background">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-black dark:text-white">Top Referrers</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2.5">
          {referrers.map((ref, index) => {
            const domainName = getDomainName(ref.referrer)
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {getReferrerIcon(ref.referrer)}
                  <span className="text-sm text-black font-medium dark:text-white">{domainName}</span>
                </div>
                <span className="text-sm font-bold text-black dark:text-white">{ref.count}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

