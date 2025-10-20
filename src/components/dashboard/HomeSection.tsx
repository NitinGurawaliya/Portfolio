"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { WelcomeCard, ProfilePictureUpload, UsernameInput } from "./home"

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
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
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

  const handlePhotoChange = (base64String: string) => {
    handleInputChange("profilePic", base64String)
  }

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
        <WelcomeCard />
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-black font-bold">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture Upload Component */}
            <ProfilePictureUpload 
              profilePic={formData.profilePic}
              displayName={formData.displayName}
              onPhotoChange={handlePhotoChange}
            />

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
              
              {/* Username Input Component */}
              <UsernameInput 
                username={formData.customUsername}
                availability={usernameAvailability || { isChecking: false, isAvailable: null, message: "" }}
                onChange={handleUsernameChange}
              />
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
