"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook,
  Youtube,
  Mail,
  Pin,
  PinOff,
  Plus,
  X,
  ExternalLink,
  Users,
  Globe,
  Phone,
  ArrowRight
} from "lucide-react"
import { SiStackoverflow, SiReddit } from "react-icons/si"
import { Skeleton } from "@/components/ui/skeleton"

interface Social {
  id?: number
  platform: string
  username: string
  url: string
  isPinned: boolean
}

interface SocialsSectionProps {
  socials: Social[]
  onAddSocial: (social: Omit<Social, 'id'>) => void
  onRemoveSocial: (socialId: number) => void
  onTogglePin: (socialId: number) => void
  onUpdateSocial: (socialId: number, updates: Partial<Social>) => void
  isLoading?: boolean
  onNavigateToSection?: (section: string) => void
}

// Platform configurations with authentic brand styling
const platformConfigs = [
  {
    id: "github",
    name: "GitHub",
    icon: Github,
    color: "#24292e",
    bgGradient: "linear-gradient(135deg, #24292e, #1a1e22)",
    placeholder: "username",
    urlPattern: "https://github.com/{username}",
    description: "Your GitHub profile",
    textColor: "#ffffff"
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "#6B7280",
    bgGradient: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    placeholder: "email",
    urlPattern: "mailto:{username}",
    description: "Your email address",
    textColor: "#374151"
  },
  {
    id: "phone",
    name: "Phone",
    icon: Phone,
    color: "#10B981",
    bgGradient: "linear-gradient(135deg, #10B981, #059669)",
    placeholder: "+1234567890",
    urlPattern: "tel:{username}",
    description: "Your phone number",
    textColor: "#ffffff"
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "#1d9bf0",
    bgGradient: "linear-gradient(135deg, #1d9bf0, #0c7abf)",
    placeholder: "username",
    urlPattern: "https://twitter.com/{username}",
    description: "Your Twitter handle",
    textColor: "#ffffff"
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    bgGradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
    placeholder: "username",
    urlPattern: "https://instagram.com/{username}",
    description: "Your Instagram handle",
    textColor: "#ffffff"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0077b5",
    bgGradient: "linear-gradient(135deg, #0077b5, #005885)",
    placeholder: "username",
    urlPattern: "https://linkedin.com/in/{username}",
    description: "Your LinkedIn profile",
    textColor: "#ffffff"
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "#1877f2",
    bgGradient: "linear-gradient(135deg, #1877f2, #0d5cbf)",
    placeholder: "username",
    urlPattern: "https://facebook.com/{username}",
    description: "Your Facebook profile",
    textColor: "#ffffff"
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "#ff0000",
    bgGradient: "linear-gradient(135deg, #ff0000, #cc0000)",
    placeholder: "channelname",
    urlPattern: "https://youtube.com/@{username}",
    description: "Your YouTube channel",
    textColor: "#ffffff"
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    icon: SiStackoverflow,
    color: "#f58025",
    bgGradient: "linear-gradient(135deg, #f58025, #d16613)",
    placeholder: "userid",
    urlPattern: "https://stackoverflow.com/users/{username}",
    description: "Your Stack Overflow profile",
    textColor: "#ffffff"
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: SiReddit,
    color: "#ff4500",
    bgGradient: "linear-gradient(135deg, #ff4500, #cc3700)",
    placeholder: "username",
    urlPattern: "https://reddit.com/u/{username}",
    description: "Your Reddit profile",
    textColor: "#ffffff"
  },
  {
    id: "other",
    name: "Other Link",
    icon: Globe,
    color: "#8B5CF6",
    bgGradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    placeholder: "https://yourwebsite.com",
    urlPattern: "{username}",
    description: "Any other custom link",
    textColor: "#ffffff"
  },
]

export function SocialsSection({ 
  socials, 
  onAddSocial, 
  onRemoveSocial, 
  onTogglePin, 
  onUpdateSocial,
  isLoading = false,
  onNavigateToSection
}: SocialsSectionProps) {
  // Create state for all platform usernames
  const [platformUsernames, setPlatformUsernames] = useState<Record<string, string>>({})
  const [platformPinned, setPlatformPinned] = useState<Record<string, boolean>>({})

  // Initialize state with existing socials
  useEffect(() => {
    const usernames: Record<string, string> = {}
    const pinned: Record<string, boolean> = {}
    
    socials.forEach(social => {
      usernames[social.platform] = social.username
      pinned[social.platform] = social.isPinned
    })
    
    setPlatformUsernames(usernames)
    setPlatformPinned(pinned)
  }, [socials])

  const handleUsernameChange = (platform: string, username: string) => {
    setPlatformUsernames(prev => ({ ...prev, [platform]: username }))
    
    // If username is provided and different from existing, update or add social
    const existingSocial = socials.find(s => s.platform === platform)
    const platformConfig = platformConfigs.find(p => p.id === platform)
    
    if (username.trim() && platformConfig) {
      const socialData = {
        platform,
        username: username.trim(),
        url: platformConfig.urlPattern.replace('{username}', username.trim()),
        isPinned: platformPinned[platform] || false
      }
      
      if (existingSocial) {
        onUpdateSocial(existingSocial.id!, socialData)
      } else {
        onAddSocial(socialData)
      }
    } else if (!username.trim() && existingSocial) {
      // Remove social if username is cleared
      onRemoveSocial(existingSocial.id!)
    }
  }

  const handlePinToggle = (platform: string) => {
    const newPinnedState = !platformPinned[platform]
    setPlatformPinned(prev => ({ ...prev, [platform]: newPinnedState }))
    
    const existingSocial = socials.find(s => s.platform === platform)
    if (existingSocial) {
      onTogglePin(existingSocial.id!)
    } else if (platformUsernames[platform]?.trim()) {
      // Create social with pinned state if username exists
      const platformConfig = platformConfigs.find(p => p.id === platform)
      if (platformConfig) {
        const socialData = {
          platform,
          username: platformUsernames[platform].trim(),
          url: platformConfig.urlPattern.replace('{username}', platformUsernames[platform].trim()),
          isPinned: newPinnedState
        }
        onAddSocial(socialData)
      }
    }
  }

  const getPlatformConfig = (platformId: string) => {
    return platformConfigs.find(p => p.id === platformId)
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="transition-all duration-300 bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-black flex items-center font-bold dark:text-white">
              Socials
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* All Social Platform Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="transition-all duration-300 bg-background">
          <CardContent className="pt-2">
            {/* Loading Skeleton */}
              {isLoading && socials.length === 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <Skeleton className="flex-1 h-12 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Actual Inputs */}
              {(!isLoading || socials.length > 0) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {platformConfigs.map((platform, index) => {
              const Icon = platform.icon
              const username = platformUsernames[platform.id] || ""
              const isPinned = platformPinned[platform.id] || false
              
                return (
                  <motion.div
                    key={platform.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-row flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background/80 p-3 transition-all duration-300 hover:shadow-lg sm:flex-nowrap"
                  >
                    {/* Platform Icon with Animation */}
                    <motion.div 
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: platform.color }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Icon className="h-6 w-6" style={{ color: platform.textColor }} />
                      </motion.div>
                    </motion.div>
                    
                    {/* Input Field with Brand Styling */}
                    <motion.div 
                      className="relative flex-1 overflow-hidden rounded-xl"
                      style={{ 
                        background: username ? platform.bgGradient : "#f3f4f6",
                        border: username ? "none" : "1px solid #e5e7eb"
                      }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                        style={{ color: username ? platform.textColor : "#6b7280" }}
                      >
                        @
                      </div>
                      <Input
                        value={username}
                        onChange={(e) => handleUsernameChange(platform.id, e.target.value)}
                        placeholder={platform.placeholder}
                        className="h-12 border-none bg-transparent pl-8 pr-10 text-sm font-medium focus:outline-none focus:ring-0"
                        style={{ 
                          color: username ? platform.textColor : "#374151"
                        }}
                      />
                      
                      {/* Clear Button for filled inputs */}
                      {username.trim() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUsernameChange(platform.id, "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full p-0 hover:bg-black/10"
                          style={{ color: platform.textColor }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </motion.div>
                    
                    {/* Pin Button with Animation */}
                    <motion.div
                      className="flex items-center justify-end sm:justify-center"
                      whileHover={{ scale: 1.1, rotate: isPinned ? 0 : 10 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant={isPinned ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePinToggle(platform.id)}
                        className={`h-10 w-10 rounded-xl transition-all duration-300 ${isPinned ? "bg-black text-white hover:bg-black/90" : "border-dashed"}`}
                        disabled={!username.trim()}
                      >
                        <motion.div
                          animate={isPinned ? { rotate: [0, -10, 10, -10, 0] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <Pin className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </motion.div>
                )
            })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pinned Socials Preview */}
      {Object.values(platformPinned).some(pinned => pinned) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-white transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-black font-bold flex items-center">
                <Pin className="h-3 w-3 mr-2" />
                Pinned on Portfolio
              </CardTitle>
              <p className="text-xs text-gray-600">
                These accounts will be visible on your portfolio
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-wrap gap-2">
                {platformConfigs
                  .filter(platform => platformPinned[platform.id] && platformUsernames[platform.id]?.trim())
                  .map((platform, index) => {
                    const Icon = platform.icon
                    const username = platformUsernames[platform.id]
                    
                    return (
                      <motion.div
                        key={platform.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center space-x-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border cursor-pointer hover:shadow-md"
                      >
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Icon 
                            className="h-3 w-3" 
                            style={{ color: platform.color }}
                          />
                        </motion.div>
                        <span className="text-xs font-medium text-black">
                          @{username}
                        </span>
                      </motion.div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {onNavigateToSection && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40">
          <Button
            variant="default"
            size="sm"
            onClick={() => onNavigateToSection("theme")}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            Next: Theme
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </motion.div>
  )
}
