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
  if (refLower.includes('t.co') || refLower.includes('twitter') || refLower.includes('x.com')) {
    return <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
    <Card className="bg-white border border-gray-200 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-black">Top Referrers</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2.5">
          {referrers.map((ref, index) => {
            const domainName = getDomainName(ref.referrer)
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {getReferrerIcon(ref.referrer)}
                  <span className="text-sm text-black font-medium">{domainName}</span>
                </div>
                <span className="text-sm font-bold text-black">{ref.count}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

