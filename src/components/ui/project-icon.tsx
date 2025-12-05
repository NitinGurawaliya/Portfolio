"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ProjectIconProps {
  favicon?: string | null
  logo?: string | null
  title: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ProjectIcon({ 
  favicon, 
  logo, 
  title, 
  className,
  size = "md" 
}: ProjectIconProps) {
  // For GitHub repos, prioritize logo (OG image) over favicon
  // Check if favicon is a GitHub favicon - if so, skip it and use logo
  const isGitHubFavicon = favicon && (
    favicon.includes('github.com') || 
    favicon.includes('githubassets') ||
    favicon.includes('githubusercontent')
  )
  
  // Determine which image to use: logo (OG image) takes priority for GitHub repos, otherwise favicon then logo
  const imageSrc = (isGitHubFavicon ? null : favicon) || logo
  
  // Generate fallback text from first 2 words of title
  const words = title.split(' ').slice(0, 2).filter(word => word.length > 0)
  const fallbackText = words.map(word => word.charAt(0).toUpperCase()).join('')
  
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm", 
    lg: "w-10 h-10 text-base"
  }

  return (
    <div className={cn(
      sizeClasses[size],
      " bg-white overflow-hidden ",
      className
    )}>
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={`${title} icon`}
          className="w-full h-full object-contain p-0.5"
          // style={{
          //   imageRendering: 'crisp-edges'
          // }}
          onError={(e) => {
            // If favicon fails to load, try to use the logo as fallback
            if (favicon && logo && e.currentTarget.src === favicon) {
              e.currentTarget.src = logo;
            }
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <span className={cn(
            "text-gray-600 font-semibold",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}>
            {fallbackText}
          </span>
        </div>
      )}
    </div>
  )
}
