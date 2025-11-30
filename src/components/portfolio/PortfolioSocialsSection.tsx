"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Edit2 } from "lucide-react"
import { SocialsModal } from "./SocialsModal"
import { SiGithub, SiX, SiLinkedin, SiInstagram, SiFacebook, SiYoutube, SiGmail, SiStackoverflow, SiReddit } from "react-icons/si"
import { Globe } from "lucide-react"
import type { Social } from "@/interface"

interface PortfolioSocialsSectionProps {
  socials: Social[]
  onSocialsChange: (socials: Social[]) => void
}

const getSocialIcon = (platform: string) => {
  const icons: Record<string, any> = {
    github: SiGithub,
    email: SiGmail,
    twitter: SiX,
    x: SiX,
    linkedin: SiLinkedin,
    instagram: SiInstagram,
    facebook: SiFacebook,
    youtube: SiYoutube,
    stackoverflow: SiStackoverflow,
    reddit: SiReddit,
  }
  return icons[platform.toLowerCase()] || Globe
}

export function PortfolioSocialsSection({
  socials,
  onSocialsChange,
}: PortfolioSocialsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debug logging
  console.log("🔍 PortfolioSocialsSection:", {
    socialsCount: socials.length,
    socials: socials.map(s => ({ platform: s.platform, username: s.username }))
  })

  return (
    <>
      <div className="bg-white py-6 px-6">
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Social Links
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
        <div>
          {socials.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {socials.map((social) => {
                const Icon = getSocialIcon(social.platform)
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-gray-700" />
                    <span className="text-sm text-gray-700">{social.username || social.platform}</span>
                  </a>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No social links added</p>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="mt-3 bg-orange-500 hover:bg-orange-600"
              >
                Add Social Links
              </Button>
            </div>
          )}
        </div>
      </div>

      <SocialsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        socials={socials}
        onSocialsChange={onSocialsChange}
      />
    </>
  )
}

