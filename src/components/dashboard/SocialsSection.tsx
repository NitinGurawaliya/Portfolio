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
  Globe
} from "lucide-react"
import { SiStackoverflow, SiReddit } from "react-icons/si"

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
]

export function SocialsSection({ 
  socials, 
  onAddSocial, 
  onRemoveSocial, 
  onTogglePin, 
  onUpdateSocial 
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
        <Card className="bg-white transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-black flex items-center font-bold">
              <Users className="h-4 w-4 mr-2" />
              Social Media Accounts
            </CardTitle>
            <p className="text-gray-600 mt-1 font-medium text-sm">
              Add your social media accounts and pin them to display on your portfolio
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* All Social Platform Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white transition-all duration-300">
          <CardContent className="pt-2 space-y-3">
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
                  className="flex items-center space-x-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  {/* Platform Icon */}
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: platform.color }}
                  >
                    <Icon 
                      className="h-6 w-6" 
                      style={{ color: platform.textColor }}
                    />
                  </div>
                  
                  {/* Input Field with Brand Styling */}
                  <div 
                    className="flex-1 relative rounded-xl overflow-hidden"
                    style={{ 
                      background: username ? platform.bgGradient : '#f3f4f6',
                      border: username ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <div 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                      style={{ color: username ? platform.textColor : '#6b7280' }}
                    >
                      @
                    </div>
                    <Input
                      value={username}
                      onChange={(e) => handleUsernameChange(platform.id, e.target.value)}
                      placeholder={platform.placeholder}
                      className="pl-8 pr-4 bg-transparent border-none text-sm font-medium h-12 focus:ring-0 focus:outline-none"
                      style={{ 
                        color: username ? platform.textColor : '#374151',
                      }}
                    />
                    
                    {/* Clear Button for filled inputs */}
                    {username.trim() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUsernameChange(platform.id, '')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-black/10"
                        style={{ color: platform.textColor }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Pin Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePinToggle(platform.id)}
                    className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
                      isPinned 
                        ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md" 
                        : "bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                    }`}
                    disabled={!username.trim()}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                </motion.div>
              )
            })}
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
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center space-x-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border"
                      >
                        <Icon 
                          className="h-3 w-3" 
                          style={{ color: platform.color }}
                        />
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
    </motion.div>
  )
}
