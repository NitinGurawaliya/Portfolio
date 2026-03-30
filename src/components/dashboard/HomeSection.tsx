"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { devLog } from "@/lib/logger"
import { HomeSectionSkeleton } from "@/components/dashboard/home/HomeSectionSkeleton"
import { ProfileBasicsCard } from "@/components/dashboard/home/ProfileBasicsCard"
import { CvUrlModal } from "@/components/dashboard/home/CvUrlModal"
import { WorkExperienceSection } from "@/components/dashboard/home/WorkExperienceSection"
import { CvResumeSection } from "@/components/dashboard/home/CvResumeSection"
import { HomeNextButton } from "@/components/dashboard/home/HomeNextButton"
import type { ExperienceItem, HomeFormData, UsernameAvailability } from "@/components/dashboard/home/types"

interface HomeUser {
  name?: string | null
  githubUsername?: string | null
  bio?: string | null
  avatarUrl?: string | null
  githubId?: string | number | null
}

interface HomeSectionProps {
  user: HomeUser | null
  portfolioData?: Partial<HomeFormData>
  onUpdate: (data: Partial<HomeFormData>) => void
  usernameAvailability?: UsernameAvailability
  isInitialLoad?: boolean
  isLoading?: boolean
  experiences?: ExperienceItem[]
  onExperiencesChange?: (experiences: ExperienceItem[]) => void
  cvUrl?: string | null
  setCvUrl?: (url: string | null) => void
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
  onNavigateToSection,
}: HomeSectionProps) {
  const [formData, setFormData] = useState<HomeFormData>({
    displayName: "",
    jobTitle: "",
    bio: "",
    profilePic: "",
    customUsername: "",
  })
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isAddExpOpen, setIsAddExpOpen] = useState(false)
  const [experiences, setExperiences] = useState<ExperienceItem[]>(experiencesProp)
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null)
  const [isCvModalOpen, setIsCvModalOpen] = useState(false)
  const [isEditingCv, setIsEditingCv] = useState(false)
  const [tempCvUrl, setTempCvUrl] = useState<string>(cvUrlProp || "")
  const bioLimit = 150
  const bioCharacterCount = formData.bio.length

  useEffect(() => {
    if (cvUrlProp !== undefined) {
      setTempCvUrl(cvUrlProp || "")
    }
  }, [cvUrlProp])

  useEffect(() => {
    if (!isCvModalOpen) {
      setTempCvUrl(cvUrlProp || "")
      setIsEditingCv(false)
    }
  }, [isCvModalOpen, cvUrlProp])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === "k" || event.key === "K")) {
        event.preventDefault()
        setIsAddExpOpen(true)
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (!user || hasInitialized) return

    setFormData({
      displayName: portfolioData?.displayName || user.name || user.githubUsername || "",
      jobTitle: portfolioData?.jobTitle || "",
      bio: portfolioData?.bio || user.bio || "",
      profilePic: portfolioData?.profilePic || user.avatarUrl || "",
      customUsername: portfolioData?.customUsername || user.githubUsername || "",
    })
    setHasInitialized(true)
  }, [user, portfolioData, hasInitialized])

  useEffect(() => {
    if (!hasInitialized || isInitialLoad) return
    if (!portfolioData || Object.keys(portfolioData).length === 0) return
    devLog("🔍 Portfolio data updated after initialization, updating formData:", portfolioData)
    setFormData((prev) => ({
      ...prev,
      displayName: portfolioData.displayName || prev.displayName,
      jobTitle: portfolioData.jobTitle || prev.jobTitle,
      bio: portfolioData.bio || prev.bio,
      profilePic: portfolioData.profilePic || prev.profilePic,
      customUsername: portfolioData.customUsername || prev.customUsername,
    }))
  }, [portfolioData, hasInitialized, isInitialLoad])

  useEffect(() => {
    setExperiences(experiencesProp || [])
  }, [experiencesProp])

  const handleInputChange = (field: keyof HomeFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      onUpdate(next)
      return next
    })
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB")
      return
    }

    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      alert("Only JPG, PNG, and GIF files are allowed")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      handleInputChange("profilePic", base64String)
    }
    reader.readAsDataURL(file)
  }

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

  const handleExperienceAdded = (experience: ExperienceItem) => {
    const withId: ExperienceItem = { ...experience, id: experience.id || Date.now() }
    const next = [withId, ...experiences]
    setExperiences(next)
    onExperiencesChange?.(next)
  }

  const handleExperienceSaved = (experience: ExperienceItem) => {
    const next = experiences.map((item) => (item.id === experience.id ? experience : item))
    setExperiences(next)
    onExperiencesChange?.(next)
  }

  if (isLoading || !user) {
    return <HomeSectionSkeleton />
  }
  const experienceUserId = String(user?.githubId || user?.githubUsername || "")

  return (
    <motion.div
      className="space-y-1.5 px-4 sm:px-6 md:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-transparent shadow-none border-none"
      >
        <ProfileBasicsCard
          formData={formData}
          bioLimit={bioLimit}
          bioCharacterCount={bioCharacterCount}
          usernameAvailability={usernameAvailability}
          onDisplayNameChange={(value) => handleInputChange("displayName", value)}
          onJobTitleChange={(value) => handleInputChange("jobTitle", value)}
          onBioChange={(value) => handleInputChange("bio", value)}
          onUsernameChange={(value) => handleInputChange("customUsername", value)}
          onPhotoChange={handlePhotoChange}
        />
      </motion.div>

      {onNavigateToSection && <HomeNextButton onNavigate={() => onNavigateToSection("repos")} />}

      <CvUrlModal
        open={isCvModalOpen}
        isEditing={isEditingCv}
        value={tempCvUrl}
        onChange={setTempCvUrl}
        onClose={() => setIsCvModalOpen(false)}
        onSave={handleSaveCvUrl}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WorkExperienceSection
            experiences={experiences}
            userId={experienceUserId}
            isAddOpen={isAddExpOpen}
            setIsAddOpen={setIsAddExpOpen}
            editingExperience={editingExperience}
            setEditingExperience={setEditingExperience}
            onExperienceAdded={handleExperienceAdded}
            onExperienceSaved={handleExperienceSaved}
          />

          <CvResumeSection
            cvUrl={cvUrlProp}
            onAddClick={() => setIsCvModalOpen(true)}
            onEditClick={handleEditCv}
            onRemoveClick={() => setCvUrlProp?.(null)}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
