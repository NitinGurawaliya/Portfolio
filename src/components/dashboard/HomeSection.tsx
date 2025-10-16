"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Upload,
  User,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { debounce } from "lodash"

interface HomeSectionProps {
  user: any
  portfolioData?: any
  onUpdate: (data: any) => void
  usernameAvailability?: {
    isChecking: boolean
    isAvailable: boolean | null
    message: string
  }
}

export function HomeSection({ user, portfolioData, onUpdate, usernameAvailability }: HomeSectionProps) {
  const [formData, setFormData] = useState({
    displayName: "",
    jobTitle: "",
    bio: "",
    profilePic: "",
    customUsername: "",
  })
  const fileInputRef = useState<HTMLInputElement | null>(null)[0]
  // Username availability is now managed by parent component
  // Update form data when portfolioData changes (from saved data) or user changes
  // Only initialize once when the component mounts or when portfolioData is first loaded
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    // Only update if we haven't initialized yet or if portfolioData becomes available for the first time
    if (!isInitialized) {
      if (portfolioData && Object.keys(portfolioData).length > 0) {
        setFormData({
          displayName: portfolioData.displayName || user?.name || "",
          jobTitle: portfolioData.jobTitle || "",
          bio: portfolioData.bio || user?.bio || "",
          profilePic: portfolioData.profilePic || user?.avatarUrl || "",
          customUsername: portfolioData.customUsername || user?.githubUsername || "",
        })
        setIsInitialized(true)
      } else if (user && !portfolioData) {
        setFormData({
          displayName: user?.name || "",
          jobTitle: "",
          bio: user?.bio || "",
          profilePic: user?.avatarUrl || "",
          customUsername: user?.githubUsername || "",
        })
        setIsInitialized(true)
      }
    }
  }, [user, portfolioData, isInitialized])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      onUpdate(next)
      return next
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB")
        return
      }
      
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        alert("Only JPG, PNG, and GIF files are allowed")
        return
      }
      
      // Create a FileReader to convert image to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        handleInputChange("profilePic", base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  // Username availability check is now handled by parent component

  // Handle username change (availability check is handled by parent)
  const handleUsernameChange = (value: string) => {
    handleInputChange("customUsername", value)
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-white   transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-black flex items-center font-bold">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👋
              </motion.div>
              <span className="ml-2">Welcome to Your Portfolio</span>
            </CardTitle>
            <motion.p 
              className="text-gray-600 mt-1 font-medium text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              We're excited to see you back! Let's customize your portfolio
            </motion.p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white   transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-black font-bold">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={formData.profilePic} />
              <AvatarFallback className="bg-black text-white">
                {formData.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                ref={(el) => {
                  if (el) {
                    const inputRef = el
                    inputRef.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/gif')
                  }
                }}
                onChange={handlePhotoChange}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                className="hidden"
                id="photo-upload"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-2 text-black hover:bg-black hover:text-white font-medium text-xs"
                onClick={() => document.getElementById('photo-upload')?.click()}
                type="button"
              >
                <Upload className="h-3 w-3 mr-1.5" />
                Change Photo
              </Button>
              <p className="text-xs text-gray-400">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-black font-medium text-sm">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                className="bg-gray-50 text-black font-medium text-sm focus:bg-white placeholder:text-gray-400"
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customUsername" className="text-black font-medium text-sm">Portfolio Username</Label>
              <div className="relative">
              <Input
                id="customUsername"
                value={formData.customUsername}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="bg-gray-50 text-black font-medium text-sm focus:bg-white pr-10 placeholder:text-gray-400"
                placeholder="Your portfolio username"
              />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameAvailability?.isChecking && (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  )}
                  {!usernameAvailability?.isChecking && usernameAvailability?.isAvailable === true && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {!usernameAvailability?.isChecking && usernameAvailability?.isAvailable === false && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {usernameAvailability?.message && (
                <p className={`text-[11px] font-medium ${
                  usernameAvailability.isAvailable === true ? 'text-green-600' : 
                  usernameAvailability.isAvailable === false ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  {usernameAvailability.message}
                </p>
              )}
              <p className="text-[11px] text-gray-500">This will be used in your portfolio URL: /portfolio/{formData.customUsername || 'username'}</p>
            </div>
          </div>

          {/* Job Title */}
          <div className="space-y-1.5">
            <Label htmlFor="jobTitle" className="text-black font-medium text-sm">Job Title</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="bg-gray-50 text-black font-medium text-sm focus:bg-white placeholder:text-gray-400"
              placeholder="e.g., Full Stack Developer, Software Engineer, etc."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-black font-medium text-sm">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="bg-gray-50 text-black font-medium text-sm focus:bg-white placeholder:text-gray-400"
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
      </motion.div>

    </motion.div>
  )
}
