"use client"

import { SkillIcon } from "@/lib/skill-icons"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

// Popular tech stack options grouped by category
const TECH_STACK_OPTIONS = {
  "Frontend": ["React", "Vue", "Angular", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind", "Bootstrap"],
  "Backend": ["Node.js", "Python", "Django", "Flask", "Go", "Rust", "Java", "Spring", "Ruby", "PHP", "Laravel"],
  "Database": ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase", "Supabase"],
  "DevOps": ["Docker", "Kubernetes", "AWS", "Vercel", "Netlify", "GCP"],
  "Mobile": ["React Native", "Flutter", "Expo", "Ionic"],
  "Other": ["Git", "Figma", "Vite", "Webpack", "Jest", "Cypress"]
}

interface TechStackSelectorProps {
  selectedTechs: string[]
  onChange: (techs: string[]) => void
  className?: string
}

export function TechStackSelector({ selectedTechs, onChange, className }: TechStackSelectorProps) {
  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      onChange(selectedTechs.filter(t => t !== tech))
    } else {
      onChange([...selectedTechs, tech])
    }
  }

  const removeTech = (tech: string) => {
    onChange(selectedTechs.filter(t => t !== tech))
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selected technologies display */}
      {selectedTechs.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border">
          {selectedTechs.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border rounded-full text-xs font-medium"
            >
              <SkillIcon skillName={tech} className="h-3.5 w-3.5" />
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => removeTech(tech)}
                className="hover:bg-muted rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Technology selector by category */}
      <div className="max-h-64 overflow-y-auto rounded-lg border bg-background">
        {Object.entries(TECH_STACK_OPTIONS).map(([category, techs]) => (
          <div key={category} className="border-b last:border-b-0">
            <div className="px-3 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground sticky top-0">
              {category}
            </div>
            <div className="p-2 flex flex-wrap gap-1.5">
              {techs.map((tech) => {
                const isSelected = selectedTechs.includes(tech)
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                      "border hover:scale-105",
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-background hover:bg-muted border-input"
                    )}
                  >
                    <SkillIcon skillName={tech} className="h-3.5 w-3.5" />
                    <span>{tech}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedTechs.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Click on technologies to add them to your project
        </p>
      )}
    </div>
  )
}

