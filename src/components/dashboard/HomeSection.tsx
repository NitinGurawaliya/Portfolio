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
import { AddExperienceModal } from "./AddExperienceModal"
import { EditExperienceModal } from "./EditExperienceModal"

interface HomeSectionProps {
  user: any
  portfolioData?: any
  onUpdate: (data: any) => void
  usernameAvailability?: {
    isChecking: boolean
    isAvailable: boolean | null
    message: string
  }
  isInitialLoad?: boolean
  experiences?: any[]
  onExperiencesChange?: (exps: any[]) => void
}

export function HomeSection({ user, portfolioData, onUpdate, usernameAvailability, isInitialLoad = false, experiences: experiencesProp = [], onExperiencesChange }: HomeSectionProps) {
  const [formData, setFormData] = useState({
    displayName: "",
    jobTitle: "",
    bio: "",
    profilePic: "",
    customUsername: "",
  })
  const fileInputRef = useState<HTMLInputElement | null>(null)[0]
  const [isAddExpOpen, setIsAddExpOpen] = useState(false)
  const [experiences, setExperiences] = useState<any[]>(experiencesProp)
  const [editingExp, setEditingExp] = useState<any | null>(null)

  // Ctrl+K to open Add Experience
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setIsAddExpOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }


  // Username availability is now managed by parent component
  // Update form data when portfolioData changes (from saved data) or user changes
  // Only initialize once when the component mounts or when portfolioData is first loaded
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false) // Track if we've done the initial setup
  
  useEffect(() => {
    console.log("🔍 HomeSection useEffect:", { portfolioData, user, isInitialized, hasInitialized })
    
    if (portfolioData && Object.keys(portfolioData).length > 0 && !hasInitialized) {
      console.log("🔍 Setting formData from portfolioData:", portfolioData)
      setFormData({
        displayName: portfolioData.displayName || user?.name || "",
        jobTitle: portfolioData.jobTitle || "",
        bio: portfolioData.bio || user?.bio || "",
        profilePic: portfolioData.profilePic || user?.avatarUrl || "",
        customUsername: portfolioData.customUsername || "", // Don't fallback to GitHub username if portfolio exists
      })
      setIsInitialized(true)
      setHasInitialized(true) // Mark that we've done initial setup
    } else if (user && !portfolioData && !hasInitialized) {
      console.log("🔍 Setting formData from user (no portfolio):", user)
      setFormData({
        displayName: user?.name || "",
        jobTitle: "",
        bio: user?.bio || "",
        profilePic: user?.avatarUrl || "",
        customUsername: user?.githubUsername || "",
      })
      setIsInitialized(true)
      setHasInitialized(true) // Mark that we've done initial setup
    }
  }, [user, portfolioData, hasInitialized])


  // Additional effect to handle portfolioData updates after initialization
  // Only update if portfolioData has changed and we've been initialized
  // Skip if still in initial load to prevent triggering change detection
  useEffect(() => {
    if (portfolioData && Object.keys(portfolioData).length > 0 && isInitialized && hasInitialized && !isInitialLoad) {
      console.log("🔍 Portfolio data updated after initialization, updating formData:", portfolioData)
      setFormData(prev => ({
        ...prev,
        displayName: portfolioData.displayName || prev.displayName,
        jobTitle: portfolioData.jobTitle || prev.jobTitle,
        bio: portfolioData.bio || prev.bio,
        profilePic: portfolioData.profilePic || prev.profilePic,
        customUsername: portfolioData.customUsername || prev.customUsername
      }))
    }
  }, [portfolioData?.displayName, portfolioData?.jobTitle, portfolioData?.bio, portfolioData?.profilePic, portfolioData?.customUsername, isInitialized, hasInitialized, isInitialLoad])

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

  useEffect(() => {
    setExperiences(experiencesProp || [])
  }, [experiencesProp])

  const handleExperienceAdded = (exp: any) => {
    const withId = { id: exp.id || Date.now(), ...exp }
    const next = [withId, ...experiences]
    setExperiences(next)
    onExperiencesChange?.(next)
  }
  const handleExperienceSaved = (exp: any) => {
    const next = experiences.map(e => (e.id === exp.id ? exp : e))
    setExperiences(next)
    onExperiencesChange?.(next)
  }

  return (
    <motion.div 
      className="space-y-2 px-6 md:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Welcome Section */}
      <motion.div
        className="-mt-6 md:-mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-transparent shadow-none border-none">
          <CardHeader className="py-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl md:text-2xl text-black flex items-center font-bold">
                <User className="h-4 w-4 mr-2" />
                Bio
              </CardTitle>
              <Button onClick={() => setIsAddExpOpen(true)} className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs rounded-lg">Add Experience</Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white shadow-none border-none">
          <CardContent className="py-1 space-y-2">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-2">
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
                value={portfolioData?.customUsername || user?.githubUsername || ""}
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
              <p className="text-[11px] text-gray-500">This will be used in your portfolio URL: /portfolio/{formData.customUsername || user?.githubUsername || 'username'}</p>
            </div>
          </div>

          {/* Job Title and Bio Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-2">
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle" className="text-black font-medium text-sm">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                className="bg-gray-50 text-black font-medium text-sm focus:bg-white placeholder:text-gray-400"
                placeholder="e.g., Full Stack Developer"
                maxLength={50}
              />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="bio" className="text-black font-medium text-sm">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="bg-gray-50 text-black font-medium text-base focus:bg-white placeholder:text-gray-400 px-3 py-1.5 leading-snug"
                placeholder="Tell us about yourself..."
                rows={2}
                maxLength={150}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Experiences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="bg-white shadow-none border-none max-w-2xl">
          <CardContent className="pt-4 space-y-4">
            <div className="text-base font-semibold text-black">Work Experience</div>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="border rounded-lg p-4 flex items-start gap-3">
                  {exp.faviconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={exp.faviconUrl} alt={exp.companyName} className="h-6 w-6 mt-0.5" />
                  ) : (
                    <div className="h-6 w-6 rounded bg-gray-200 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm text-black">
                        {exp.companyName}
                        {exp.role ? <span className="text-gray-500 font-normal"> • {exp.role}</span> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" className="h-8 rounded-lg text-xs" onClick={() => setEditingExp(exp)}>Edit</Button>
                      </div>
                    </div>
                    {exp.duration ? (
                      <div className="text-[11px] text-gray-500 mt-0.5">{exp.duration}</div>
                    ) : null}
                    {exp.description ? (
                      <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{exp.description}</div>
                    ) : null}
                  </div>
                </div>
              ))}
              {experiences.length === 0 && (
                <div className="text-xs text-gray-500">No experiences added yet.</div>
              )}
            </div>

            <AddExperienceModal
              open={isAddExpOpen}
              onOpenChange={setIsAddExpOpen}
              userId={((user as any)?.githubId?.toString?.() || (user as any)?.githubUsername) as string}
              onAdded={handleExperienceAdded}
            />
            {editingExp && (
              <EditExperienceModal
                open={!!editingExp}
                onOpenChange={(o) => !o && setEditingExp(null)}
                userId={((user as any)?.githubId?.toString?.() || (user as any)?.githubUsername) as string}
                initial={editingExp}
                onSave={handleExperienceSaved}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  )
}
