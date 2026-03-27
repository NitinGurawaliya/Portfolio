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
import { cn } from "@/lib/utils"
import {
  Upload,
  User,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Pencil,
  Trash2,
  Plus,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Globe
} from "lucide-react"
import { debounce } from "lodash"
import { AddExperienceModal } from "./AddExperienceModal"
import { EditExperienceModal } from "./EditExperienceModal"
import { Skeleton } from "@/components/ui/skeleton"

interface Social {
  id?: number
  platform: string
  username: string
  url: string
  isPinned: boolean
}

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
  isLoading?: boolean
  experiences?: any[]
  onExperiencesChange?: (exps: any[]) => void
  cvUrl?: string | null
  setCvUrl?: (url: string | null) => void
  socials?: Social[]
  onAddSocial?: (social: Omit<Social, 'id'>) => void
  onRemoveSocial?: (socialId: number) => void
  onTogglePin?: (socialId: number) => void
  onUpdateSocial?: (socialId: number, updates: Partial<Social>) => void
  onNavigateToSection?: (section: string) => void
}

export function HomeSection({
  user,
  portfolioData,
  onUpdate,
  usernameAvailability,
  isInitialLoad = false,
  isLoading = false,
  experiences: experiencesProp = [],
  onExperiencesChange,
  cvUrl: cvUrlProp,
  setCvUrl: setCvUrlProp,
  socials: socialsProp = [],
  onAddSocial,
  onRemoveSocial,
  onTogglePin,
  onUpdateSocial,
  onNavigateToSection,
}: HomeSectionProps) {
  // Initialize formData - will be updated by useEffect when user/portfolioData loads
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
  const [isCvModalOpen, setIsCvModalOpen] = useState(false)
  const [tempCvUrl, setTempCvUrl] = useState<string>(cvUrlProp || "")
  const [isEditingCv, setIsEditingCv] = useState(false)
  const [socials, setSocials] = useState<Social[]>(socialsProp)
  const [platformUsernames, setPlatformUsernames] = useState<Record<string, string>>({})
  const bioLimit = 150

  // Sync cvUrl with prop
  useEffect(() => {
    if (cvUrlProp !== undefined) {
      setTempCvUrl(cvUrlProp || "")
    }
  }, [cvUrlProp])

  // Reset modal when closed
  useEffect(() => {
    if (!isCvModalOpen) {
      setTempCvUrl(cvUrlProp || "")
      setIsEditingCv(false)
    }
  }, [isCvModalOpen, cvUrlProp])

  const handleSaveCvUrl = () => {
    if (setCvUrlProp && tempCvUrl.trim()) {
      setCvUrlProp(tempCvUrl.trim())
    }
    setIsCvModalOpen(false)
    setIsEditingCv(false)
  }

  const handleEditCv = () => {
    setTempCvUrl(cvUrlProp || "")
    setIsEditingCv(true)
    setIsCvModalOpen(true)
  }

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
    // Initialize formData immediately when user or portfolioData is available
    // ALWAYS prioritize portfolioData over user data (portfolio data is from DB, more accurate)
    if (user && !hasInitialized) {
      // CRITICAL: If isLoading is true, wait for portfolio data to load
      // Don't use GitHub fallback if we're still loading portfolio data
      if (isLoading) {
        console.log("⏳ HomeSection: Still loading portfolio data, waiting...")
        return
      }
      
      // If portfolioData exists (even if empty), use it exclusively (don't fallback to user data)
      // Only use user data if portfolioData is completely missing AND not loading
      const hasPortfolioData = portfolioData && (
        portfolioData.displayName || 
        portfolioData.bio || 
        portfolioData.profilePic ||
        portfolioData.jobTitle ||
        portfolioData.customUsername
      )
      
      console.log("🔄 HomeSection: Initializing formData", {
        hasPortfolioData,
        isLoading,
        isInitialLoad,
        portfolioDataKeys: portfolioData ? Object.keys(portfolioData) : [],
        displayName: portfolioData?.displayName || "empty",
        customUsername: portfolioData?.customUsername || "empty"
      })
      
      // ALWAYS use portfolioData if it exists, even if fields are empty
      // This ensures we don't fallback to GitHub data when portfolio data is loaded
      const displayName = portfolioData?.displayName || ""
      const bio = portfolioData?.bio || ""
      const profilePic = portfolioData?.profilePic || ""
      const jobTitle = portfolioData?.jobTitle || ""
      // CRITICAL: Use customUsername from portfolioData, not GitHub username
      const customUsername = portfolioData?.customUsername || user.githubUsername || ""

      // Set formData immediately for instant display
      setFormData({
        displayName,
        jobTitle,
        bio,
        profilePic,
        customUsername,
      })
      setIsInitialized(true)
      setHasInitialized(true)
    }
  }, [user, portfolioData, hasInitialized, isLoading, isInitialLoad])

  // Update formData when portfolioData loads/updates (prioritize portfolio data)
  // This is critical - ALWAYS use portfolioData, never fallback to GitHub data
  useEffect(() => {
    if (user && hasInitialized && portfolioData) {
      // ALWAYS update from portfolioData - don't check if it's empty
      // This ensures portfolio data (even if empty) takes precedence over GitHub data
      console.log("🔄 HomeSection: Updating formData from portfolioData", {
        isLoading,
        displayName: portfolioData?.displayName || "empty",
        customUsername: portfolioData?.customUsername || "empty",
        bio: portfolioData?.bio?.substring(0, 30) || "empty"
      })
      
      // Always use portfolioData - never fallback to GitHub data
      setFormData(prev => ({
        displayName: portfolioData?.displayName ?? prev.displayName ?? "",
        jobTitle: portfolioData?.jobTitle ?? prev.jobTitle ?? "",
        bio: portfolioData?.bio ?? prev.bio ?? "",
        profilePic: portfolioData?.profilePic ?? prev.profilePic ?? "",
        // CRITICAL: Use customUsername from portfolioData, not GitHub username
        customUsername: portfolioData?.customUsername ?? prev.customUsername ?? user.githubUsername ?? "",
      }))
    }
  }, [portfolioData?.displayName, portfolioData?.jobTitle, portfolioData?.bio, portfolioData?.profilePic, portfolioData?.customUsername, user, hasInitialized, isLoading])


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

  // Sync socials with prop
  useEffect(() => {
    setSocials(socialsProp || [])
  }, [socialsProp])

  // Initialize platform usernames from socials
  useEffect(() => {
    const usernames: Record<string, string> = {}
    socials.forEach(social => {
      usernames[social.platform] = social.username
    })
    setPlatformUsernames(usernames)
  }, [socials])

  // Platform configurations
  const platformConfigs = [
    { id: "github", name: "GitHub", icon: Github, color: "#24292e", urlPrefix: "github.com/", urlPattern: "https://github.com/{username}" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "#1d9bf0", urlPrefix: "twitter.com/", urlPattern: "https://twitter.com/{username}" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "#0077b5", urlPrefix: "linkedin.com/in/", urlPattern: "https://linkedin.com/in/{username}" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "#E4405F", urlPrefix: "instagram.com/", urlPattern: "https://instagram.com/{username}" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "#1877f2", urlPrefix: "facebook.com/", urlPattern: "https://facebook.com/{username}" },
    { id: "youtube", name: "YouTube", icon: Youtube, color: "#ff0000", urlPrefix: "youtube.com/@", urlPattern: "https://youtube.com/@{username}" },
    { id: "email", name: "Email", icon: Mail, color: "#6B7280", urlPrefix: "", urlPattern: "mailto:{username}" },
    { id: "other", name: "Website", icon: Globe, color: "#8B5CF6", urlPrefix: "", urlPattern: "{username}" },
  ]

  const handleSocialUsernameChange = (platform: string, username: string) => {
    setPlatformUsernames(prev => ({ ...prev, [platform]: username }))
    
    const existingSocial = socials.find(s => s.platform === platform)
    const platformConfig = platformConfigs.find(p => p.id === platform)
    
    if (username.trim() && platformConfig && onAddSocial && onUpdateSocial) {
      const socialData = {
        platform,
        username: username.trim(),
        url: platformConfig.urlPattern.replace('{username}', username.trim()),
        isPinned: false
      }
      
      if (existingSocial && existingSocial.id) {
        onUpdateSocial(existingSocial.id, socialData)
      } else {
        onAddSocial(socialData)
      }
    } else if (!username.trim() && existingSocial && existingSocial.id && onRemoveSocial) {
      onRemoveSocial(existingSocial.id)
    }
  }

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

  // Show skeleton ONLY if:
  // 1. Currently loading, OR
  // 2. User not loaded yet
  // Once user is loaded, we show data immediately (even if empty, it's better than skeleton flicker)
  const shouldShowSkeleton = isLoading || !user

  const bioCharacterCount = formData.bio.length

  if (shouldShowSkeleton) {
    return (
      <div className="space-y-2 px-4 sm:px-6 md:px-10">
        {/* Header Skeleton */}
        <div className="-mt-6 md:-mt-8">
          <Skeleton className="h-8 w-32 mb-4" />
        </div>

        {/* Profile Card Skeleton */}
        <Card className="bg-white shadow-none border-none">
          <CardContent className="py-1 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Experience Section Skeleton */}
        <Card className="bg-white shadow-none border-none">
          <CardContent className="pt-4 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-1.5 px-4 sm:px-6 md:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Welcome Section */}
      {/* <motion.div
        className="-mt-6 md:-mt-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="bg-transparent shadow-none border-none">
          <CardHeader className="py-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl md:text-2xl flex items-center font-bold text-gray-900 dark:text-gray-100"
              >
                Bio
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      </motion.div> */}

      {/* Profile Section with Two-Column Layout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-transparent shadow-none border-none"
        >
           
          <Card className="rounded-2xl bg-transparent shadow-none border-none">
            <CardContent className="space-y-3.5 sm:space-y-4.5 p-4 sm:p-5">
              {/* Profile Photo Section */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={formData.profilePic} alt={formData.displayName || "Profile"} />
                  <AvatarFallback className="text-base">{(formData.displayName || "U").charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("profilePicInput")?.click()}
                    className="h-7 rounded-lg px-2 text-xs"
                  >
                    Change photo
                  </Button>
                  <span className="text-[10px] text-muted-foreground">
                    PNG, JPG or GIF (max 2MB)
                  </span>
                </div>
                <input
                  id="profilePicInput"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Two-Column Form */}
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {/* Display Name */}
                <div className="space-y-1 max-w-[300px]">
                  <Label htmlFor="displayName" className="text-sm font-semibold text-black tracking-wide">
                    Full Name 
                  </Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    className="h-9 rounded-lg border border-gray-300 bg-muted/30 text-[13px] focus-visible:ring-0 hover:shadow-md focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                {/* Portfolio Username - Above Job Title */}
                <div className="space-y-1 max-w-[300px]">
                  <Label htmlFor="customUsername" className="text-sm font-semibold text-black tracking-wide">
                    Portfolio username
                  </Label>
                  <div className="relative">
                    <Input
                      id="customUsername"
                      value={portfolioData?.customUsername || user?.githubUsername || ""}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="h-9 rounded-lg border border-gray-300 bg-muted/30 pl-7 text-[13px] focus-visible:ring-0 hover:shadow-md focus:outline-none"
                      placeholder="Choose a unique username"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                      /
                    </span>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameAvailability?.isChecking && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      )}
                      {!usernameAvailability?.isChecking && usernameAvailability?.isAvailable === true && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      {!usernameAvailability?.isChecking && usernameAvailability?.isAvailable === false && (
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                  </div>
                  {usernameAvailability?.message && (
                    <p
                      className={cn(
                        "text-xs font-medium leading-tight",
                        usernameAvailability.isAvailable === true
                          ? "text-emerald-600"
                          : usernameAvailability.isAvailable === false
                            ? "text-red-600"
                            : "text-muted-foreground"
                      )}
                    >
                      {usernameAvailability.message}
                    </p>
                  )}
                </div>

                {/* Job Title */}
                <div className="space-y-1 max-w-[300px]">
                  <Label htmlFor="jobTitle" className="text-sm font-semibold text-black tracking-wide">
                    Job title
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    className="h-9 rounded-lg border border-gray-300 bg-muted/30 text-[13px] focus-visible:ring-0 hover:shadow-md focus:outline-none"
                    placeholder="e.g. • Full Stack Developer"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Bio - Full Width */}
              <div className="space-y-1">
                <Label htmlFor="bio" className="text-sm font-semibold text-black tracking-wide">
                  Bio <span className="ml-1 text-[11px] normal-case text-muted-foreground font-normal">(max {bioLimit} characters)</span>
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="rounded-lg border border-gray-300 bg-muted/30 text-[13px] focus-visible:ring-0 hover:shadow-md focus:outline-none"
                  placeholder="Share your story, mission, or current focus…"
                  rows={3}
                  maxLength={bioLimit}
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>This text appears in your live portfolio hero section.</span>
                  <span>
                    {bioCharacterCount}/{bioLimit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {onNavigateToSection && (
          <div className="pointer-events-none fixed bottom-6 right-6 z-40">
            <Button
              variant="default"
              size="sm"
              onClick={() => onNavigateToSection("repos")}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Next: Projects
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      {/* CV URL Modal */}
      {isCvModalOpen && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCvModalOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-[720px] max-w-full rounded-xl bg-white shadow-2xl border border-gray-200">
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <div className="text-xl text-black font-bold">{isEditingCv ? 'Edit CV/Resume' : 'Add CV/Resume'}</div>
                  <div className="text-xs text-gray-500">Enter the URL to your CV or Resume. Users will be able to download it from your portfolio.</div>
                </div>
              </div>
              {/* Content */}
              <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cvUrl" className="text-black font-medium">CV/Resume URL</Label>
                  <Input
                    id="cvUrl"
                    value={tempCvUrl}
                    onChange={(e) => setTempCvUrl(e.target.value)}
                    placeholder="https://example.com/cv.pdf"
                    className="bg-gray-50 text-black focus:bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    Paste a direct link to your CV or Resume PDF
                  </p>
                </div>
              </div>
              {/* Footer */}
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCvModalOpen(false)} className="bg-white text-black border-gray-300">
                  Cancel
                </Button>
                <Button onClick={handleSaveCvUrl} className="bg-black text-white hover:bg-gray-800">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Experience Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="bg-white dark:bg-background shadow-none border-card/80">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900 dark:text-gray-100">Work Experience</div>
              <Button onClick={() => setIsAddExpOpen(true)} className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs rounded-lg"><Plus className="h-4 w-4" /> Add Experience</Button>
            </div>
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

      {/* CV/Resume Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-background shadow-none border-card/80">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900 dark:text-gray-100">CV/Resume</div>
              <Button
                type="button"
                onClick={() => setIsCvModalOpen(true)}
                disabled={!!cvUrlProp}
                className={`h-8 px-3 text-xs ${cvUrlProp ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                <Plus className="h-4 w-4" />
                Add CV
              </Button>
            </div>

            {/* CV Cards */}
            <div className="space-y-3">
              {cvUrlProp && (
                <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 bg-white shadow-sm">
                  {/* Document Icon */}
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-gray-700" />
                  </div>

                  {/* CV Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-black mb-0.5">CV Document</div>
                    <div className="text-xs text-gray-500 truncate">{cvUrlProp}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCv}
                      className="h-8 w-8 p-0 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      <Pencil className="h-4 w-4 text-gray-700" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (setCvUrlProp) {
                          setCvUrlProp(null)
                        }
                      }}
                      className="h-8 w-8 p-0 rounded-lg bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              )}

              {!cvUrlProp && (
                <div className="text-xs text-gray-500">No CV/Resume added yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Media Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className="bg-white dark:bg-background shadow-none border-card/80">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900 dark:text-gray-100">Social Media</div>
            </div>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {platformConfigs.map((platform) => {
                const Icon = platform.icon
                const username = platformUsernames[platform.id] || ""
                const showPrefix = platform.urlPrefix && (platform.id !== "email" && platform.id !== "other")
                const prefixWidth = showPrefix ? platform.urlPrefix.length * 7.5 : 0
                
                return (
                  <div key={platform.id} className="space-y-1 max-w-[300px]">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <Icon className="h-4 w-4" style={{ color: platform.color }} />
                      </div>
                      {showPrefix && (
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-[13px] text-gray-500 font-medium">
                          {platform.urlPrefix}
                        </div>
                      )}
                      <Input
                        id={`social-${platform.id}`}
                        value={username}
                        onChange={(e) => handleSocialUsernameChange(platform.id, e.target.value)}
                        className="h-9 rounded-lg border border-gray-300 bg-muted/30 pr-3 text-[13px] focus-visible:ring-0 hover:shadow-md focus:outline-none"
                        style={{ 
                          paddingLeft: showPrefix ? `${40 + prefixWidth}px` : '40px'
                        }}
                        placeholder={platform.id === "email" ? "email@example.com" : platform.id === "other" ? "https://yoursite.com" : "username"}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  )
}