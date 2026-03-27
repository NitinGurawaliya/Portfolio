"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SkillIcon } from "@/lib/skill-icons"
import type { Skill } from "@/interface"

interface PortfolioBioSectionProps {
  portfolioData: {
    displayName: string
    jobTitle: string
    bio: string
    profilePic: string
  }
  skills: Skill[]
  onUpdate: (updates: Partial<PortfolioBioSectionProps["portfolioData"]>) => void
  onSkillsChange: (skills: Skill[]) => void
  availableLanguages?: string[]
}

export function PortfolioBioSection({ 
  portfolioData, 
  skills,
  onUpdate, 
  onSkillsChange,
  availableLanguages = []
}: PortfolioBioSectionProps) {
  const router = useRouter()
  
  // Debug logging
  useEffect(() => {
    console.log("🔍 PortfolioBioSection RENDER:", {
      displayName: portfolioData.displayName,
      jobTitle: portfolioData.jobTitle,
      bio: portfolioData.bio,
      bioLength: portfolioData.bio?.length || 0,
      profilePic: portfolioData.profilePic,
      profilePicLength: portfolioData.profilePic?.length || 0,
      skillsCount: skills.length,
      skills: skills.map(s => ({ id: s.id, name: s.name })),
      hasDisplayName: !!portfolioData.displayName,
      hasBio: !!portfolioData.bio,
      hasProfilePic: !!portfolioData.profilePic,
      portfolioDataObject: portfolioData
    })
  }, [portfolioData, skills])

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Navigate to /portfolio/bio using router
    router.push("/portfolio/bio")
  }

  return (
    <>
      <div className="relative bg-white py-8 w-full px-6">
        {/* Edit Button - Top Right */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleEditClick}
            className="inline-flex items-center border border-gray-300 text-xs text-gray-500 hover:text-gray-700 h-8 px-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Edit2 className="h-2 w-2 mr-1.5" />
            Edit Bio
          </button>
        </div>

        {/* Content - Centered */}
        <div className="flex flex-col items-center w-full">
          {/* Profile Picture */}
          <div className="relative mb-3">
            <Avatar className="h-20 w-20 border-2 border-gray-300">
              <AvatarImage
                src={portfolioData.profilePic || ""}
                alt={portfolioData.displayName || "Profile"}
              />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xl">
                {(portfolioData.displayName || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name - Always show */}
          <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
            {portfolioData?.displayName || "Your Name"}
          </h2>

          {/* Job Title - Always show (empty state handled by component) */}
          {portfolioData?.jobTitle && (
            <p className="text-sm text-black font-medium mb-2 text-center">
              {portfolioData.jobTitle}
            </p>
          )}

          {/* Bio - Always show (empty state handled by component) */}
          {portfolioData?.bio && (
            <p className="text-sm text-black font-medium leading-relaxed mb-3 text-center max-w-3xl px-4">
              {portfolioData.bio}
            </p>
          )}

          {/* Skills - Always show container, content conditionally */}
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {skills.length > 0 ? (
              // Remove duplicates by using a Set
              Array.from(new Map(skills.map(skill => [skill.id, skill])).values()).map((skill, index) => (
                <Badge
                  key={`${skill.id}-${index}`}
                  variant="secondary"
                  className="px-3 py-1.5 text-xs flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 rounded-md"
                >
                  <SkillIcon skillName={skill.name} className="h-4 w-4" />
                  {skill.name}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No skills added yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

