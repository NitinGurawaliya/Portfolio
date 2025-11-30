"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Search } from "lucide-react"
import { SkillIcon } from "@/lib/skill-icons"
import type { Skill } from "@/interface"

interface EditBioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolioData: {
    displayName: string
    jobTitle: string
    bio: string
    profilePic: string
  }
  skills: Skill[]
  onUpdate: (updates: Partial<EditBioModalProps["portfolioData"]>) => void
  onSkillsChange: (skills: Skill[]) => void
  availableLanguages?: string[]
}

export function EditBioModal({
  open,
  onOpenChange,
  portfolioData,
  skills,
  onUpdate,
  onSkillsChange,
  availableLanguages = [],
}: EditBioModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [customSkill, setCustomSkill] = useState("")

  const addedSkillNames = new Set(skills.map(s => s.name.toLowerCase()))
  
  const filteredLanguages = availableLanguages.filter(lang =>
    lang.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !addedSkillNames.has(lang.toLowerCase())
  )

  const handleAddSkill = (skillName: string) => {
    if (!addedSkillNames.has(skillName.toLowerCase())) {
      onSkillsChange([
        ...skills,
        {
          id: Date.now().toString(),
          name: skillName,
          category: "Languages"
        }
      ])
    }
  }

  const handleRemoveSkill = (skillId: string) => {
    onSkillsChange(skills.filter(s => s.id !== skillId))
  }

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !addedSkillNames.has(customSkill.trim().toLowerCase())) {
      onSkillsChange([
        ...skills,
        {
          id: Date.now().toString(),
          name: customSkill.trim(),
          category: "Custom"
        }
      ])
      setCustomSkill("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Profile Picture */}
          <div>
            <Label htmlFor="profilePic">Profile Picture URL</Label>
            <Input
              id="profilePic"
              value={portfolioData.profilePic}
              onChange={(e) => onUpdate({ profilePic: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="displayName">Name *</Label>
            <Input
              id="displayName"
              value={portfolioData.displayName}
              onChange={(e) => onUpdate({ displayName: e.target.value })}
              placeholder="Your name"
              className="mt-1"
              required
            />
          </div>

          {/* Job Title */}
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={portfolioData.jobTitle}
              onChange={(e) => onUpdate({ jobTitle: e.target.value })}
              placeholder="e.g., Full Stack Developer"
              className="mt-1"
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={portfolioData.bio}
              onChange={(e) => onUpdate({ bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="mt-1 min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Skills Section */}
          <div>
            <Label>Skills</Label>
            
            {/* Current Skills */}
            {skills.length > 0 && (
              <div className="mt-2 mb-4">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200"
                    >
                      <SkillIcon skillName={skill.name} className="h-4 w-4" />
                      {skill.name}
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="ml-1 hover:bg-orange-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add from GitHub Languages */}
            {availableLanguages.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search languages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {filteredLanguages.slice(0, 20).map((lang) => (
                    <Button
                      key={lang}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSkill(lang)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Skill */}
            <div className="mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCustomSkill()
                    }
                  }}
                />
                <Button
                  onClick={handleAddCustomSkill}
                  disabled={!customSkill.trim() || addedSkillNames.has(customSkill.trim().toLowerCase())}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)} className="bg-orange-500 hover:bg-orange-600">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

