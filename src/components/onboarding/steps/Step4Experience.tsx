"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { X, Plus, Briefcase } from "lucide-react"

interface Step4ExperienceProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function Step4Experience({ data, updateData, onNext, onBack }: Step4ExperienceProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    duration: "",
    description: "",
    companyUrl: "",
  })

  const addExperience = () => {
    if (!formData.companyName || !formData.role) return

    const newExp = {
      ...formData,
      id: Date.now(),
      faviconUrl: formData.companyUrl ? `https://www.google.com/s2/favicons?domain=${formData.companyUrl}&sz=128` : ""
    }

    updateData({ experiences: [...data.experiences, newExp] })
    setFormData({
      companyName: "",
      role: "",
      duration: "",
      description: "",
      companyUrl: "",
    })
    setShowForm(false)
  }

  const removeExperience = (id: number) => {
    updateData({ experiences: data.experiences.filter((e: any) => e.id !== id) })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Work Experience</h2>
        <p className="text-muted-foreground">
          Add your professional experience (optional)
        </p>
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      )}

      {showForm && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Add Work Experience
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Inc"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  placeholder="Software Engineer"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="Jan 2023 - Present"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyUrl">Company Website</Label>
                <Input
                  id="companyUrl"
                  placeholder="https://company.com"
                  value={formData.companyUrl}
                  onChange={(e) => setFormData({ ...formData, companyUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What did you do at this company..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={addExperience}
              disabled={!formData.companyName || !formData.role}
              className="flex-1"
            >
              Add Experience
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Added Experiences */}
      {data.experiences.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Work Experience ({data.experiences.length})</h3>
          <div className="space-y-2">
            {data.experiences.map((exp: any) => (
              <Card key={exp.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                    {exp.duration && (
                      <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                    )}
                    {exp.description && (
                      <p className="text-sm mt-2 line-clamp-2">{exp.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}

