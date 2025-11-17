"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface Step2SkillsProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

const popularSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Python", "Java", "C++", "Go", "Rust",
  "HTML", "CSS", "Tailwind CSS", "Vue", "Angular",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker",
  "AWS", "GCP", "Azure", "Kubernetes", "Git",
  "GraphQL", "REST API", "Firebase", "Supabase", "Prisma"
]

export function Step2Skills({ data, updateData, onNext, onBack }: Step2SkillsProps) {
  const [customSkill, setCustomSkill] = useState("")

  const addSkill = (skillName: string, category: string = "Other") => {
    if (!skillName || data.skills.some((s: any) => s.name === skillName)) return

    const newSkill = {
      id: Date.now().toString() + Math.random(),
      name: skillName,
      category
    }

    updateData({ skills: [...data.skills, newSkill] })
  }

  const removeSkill = (id: string) => {
    updateData({ skills: data.skills.filter((s: any) => s.id !== id) })
  }

  const addCustomSkill = () => {
    if (customSkill) {
      addSkill(customSkill, "Custom")
      setCustomSkill("")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Add Your Skills</h2>
        <p className="text-muted-foreground">
          Select from popular skills or add your own
        </p>
      </div>

      {/* Custom Skill Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add custom skill..."
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
        />
        <Button onClick={addCustomSkill} disabled={!customSkill}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Popular Skills */}
      <div className="space-y-3">
        <h3 className="font-semibold">Popular Skills</h3>
        <div className="flex flex-wrap gap-2">
          {popularSkills.map((skill) => {
            const isAdded = data.skills.some((s: any) => s.name === skill)
            return (
              <Badge
                key={skill}
                variant={isAdded ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => !isAdded && addSkill(skill, "Technical")}
              >
                {skill}
                {isAdded && " ✓"}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Selected Skills */}
      {data.skills.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Selected Skills ({data.skills.length})</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill: any) => (
              <Badge key={skill.id} variant="secondary" className="gap-1">
                {skill.name}
                <button onClick={() => removeSkill(skill.id)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={data.skills.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  )
}

