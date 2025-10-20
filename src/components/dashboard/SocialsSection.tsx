"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Pin, X, Users } from "lucide-react"
import { SOCIAL_PLATFORMS, getPlatformConfig } from "@/constants/social-platforms"

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

// Using platform configs from constants
const platformConfigs = SOCIAL_PLATFORMS

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
    const platformConfig = getPlatformConfig(platform)
    
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
      const platformConfig = getPlatformConfig(platform)
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

  // Use the utility function from constants
  // const getPlatformConfig = getPlatformConfig (already imported)

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
                  {/* Platform Icon with Animation */}
                  <motion.div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: platform.color }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -2, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Icon 
                        className="h-6 w-6" 
                        style={{ color: platform.textColor }}
                      />
                    </motion.div>
                  </motion.div>
                  
                  {/* Input Field with Brand Styling */}
                  <motion.div 
                    className="flex-1 relative rounded-xl overflow-hidden"
                    style={{ 
                      background: username ? platform.bgGradient : '#f3f4f6',
                      border: username ? 'none' : '1px solid #e5e7eb'
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
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
                      className="pl-8 pr-10 bg-transparent border-none text-sm font-medium h-12 focus:ring-0 focus:outline-none"
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
                  </motion.div>
                  
                  {/* Pin Button with Animation */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: isPinned ? 0 : 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
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
    </motion.div>
  )
}
