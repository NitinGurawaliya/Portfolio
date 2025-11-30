"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { SiGithub, SiX, SiLinkedin, SiInstagram, SiFacebook, SiYoutube, SiGmail, SiStackoverflow, SiReddit } from "react-icons/si"
import { Globe } from "lucide-react"
import type { Social } from "@/interface"

interface SocialsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  socials: Social[]
  onSocialsChange: (socials: Social[]) => void
}

const PLATFORMS = [
  { value: "github", label: "GitHub", icon: SiGithub, baseUrl: "https://github.com/" },
  { value: "twitter", label: "Twitter/X", icon: SiX, baseUrl: "https://twitter.com/" },
  { value: "linkedin", label: "LinkedIn", icon: SiLinkedin, baseUrl: "https://linkedin.com/in/" },
  { value: "instagram", label: "Instagram", icon: SiInstagram, baseUrl: "https://instagram.com/" },
  { value: "facebook", label: "Facebook", icon: SiFacebook, baseUrl: "https://facebook.com/" },
  { value: "youtube", label: "YouTube", icon: SiYoutube, baseUrl: "https://youtube.com/@" },
  { value: "email", label: "Email", icon: SiGmail, baseUrl: "mailto:" },
  { value: "stackoverflow", label: "Stack Overflow", icon: SiStackoverflow, baseUrl: "https://stackoverflow.com/users/" },
  { value: "reddit", label: "Reddit", icon: SiReddit, baseUrl: "https://reddit.com/user/" },
]

export function SocialsModal({
  open,
  onOpenChange,
  socials,
  onSocialsChange,
}: SocialsModalProps) {
  const [newSocials, setNewSocials] = useState<Array<{ platform: string; username: string }>>(
    socials.map(s => ({ platform: s.platform, username: s.username || "" }))
  )

  const handleAddSocial = () => {
    setNewSocials([...newSocials, { platform: "", username: "" }])
  }

  const handleUpdateSocial = (index: number, field: "platform" | "username", value: string) => {
    const updated = [...newSocials]
    updated[index] = { ...updated[index], [field]: value }
    setNewSocials(updated)
  }

  const handleRemoveSocial = (index: number) => {
    setNewSocials(newSocials.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const validSocials = newSocials
      .filter(s => s.platform && s.username)
      .map((s, idx) => {
        const platform = PLATFORMS.find(p => p.value === s.platform)
        return {
          id: socials[idx]?.id || Date.now() + idx,
          platform: s.platform,
          username: s.username,
          url: platform ? `${platform.baseUrl}${s.username}` : s.username,
          isPinned: false
        }
      })
    
    onSocialsChange(validSocials)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Social Links</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {newSocials.map((social, index) => {
            const Icon = PLATFORMS.find(p => p.value === social.platform)?.icon || Globe
            return (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={social.platform}
                  onChange={(e) => handleUpdateSocial(index, "platform", e.target.value)}
                  className="flex-shrink-0 w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Platform</option>
                  {PLATFORMS.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                <Input
                  value={social.username}
                  onChange={(e) => handleUpdateSocial(index, "username", e.target.value)}
                  placeholder="username"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSocial(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}

          <Button
            variant="outline"
            onClick={handleAddSocial}
            className="w-full"
          >
            Add Social
          </Button>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

