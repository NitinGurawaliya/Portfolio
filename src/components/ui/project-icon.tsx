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
  // Determine which image to use (favicon takes priority over logo)
  const imageSrc = favicon || logo
  
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
      "rounded-full bg-white overflow-hidden ring-1 ring-black/5 shadow-sm",
      className
    )}>
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={`${title} icon`}
          className="w-full h-full object-contain p-0.5"
          style={{
            imageRendering: 'crisp-edges'
          }}
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
