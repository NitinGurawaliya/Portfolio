import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddExperienceModal } from "@/components/dashboard/AddExperienceModal"
import { EditExperienceModal } from "@/components/dashboard/EditExperienceModal"
import type { ExperienceItem } from "./types"

interface WorkExperienceSectionProps {
  experiences: ExperienceItem[]
  userId: string
  isAddOpen: boolean
  setIsAddOpen: (open: boolean) => void
  editingExperience: ExperienceItem | null
  setEditingExperience: (experience: ExperienceItem | null) => void
  onExperienceAdded: (experience: ExperienceItem) => void
  onExperienceSaved: (experience: ExperienceItem) => void
}

export function WorkExperienceSection({
  experiences,
  userId,
  isAddOpen,
  setIsAddOpen,
  editingExperience,
  setEditingExperience,
  onExperienceAdded,
  onExperienceSaved,
}: WorkExperienceSectionProps) {
  return (
    <Card className="bg-white dark:bg-background shadow-none border-card/80">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900 dark:text-gray-100">Work Experience</div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs rounded-lg">
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        </div>

        <div className="space-y-3">
          {experiences.map((experience) => (
            <div key={experience.id} className="border rounded-lg p-4 flex items-start gap-3">
              {experience.faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={experience.faviconUrl} alt={experience.companyName || "Company"} className="h-6 w-6 mt-0.5" />
              ) : (
                <div className="h-6 w-6 rounded bg-gray-200 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-black">
                    {experience.companyName}
                    {experience.role ? <span className="text-gray-500 font-normal"> • {experience.role}</span> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-8 rounded-lg text-xs"
                      onClick={() => setEditingExperience(experience)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                {experience.duration ? (
                  <div className="text-[11px] text-gray-500 mt-0.5">{experience.duration}</div>
                ) : null}
                {experience.description ? (
                  <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{experience.description}</div>
                ) : null}
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="text-xs text-gray-500">No experiences added yet.</div>
          )}
        </div>

        <AddExperienceModal
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          userId={userId}
          onAdded={onExperienceAdded}
        />

        {editingExperience && (
          <EditExperienceModal
            open={Boolean(editingExperience)}
            onOpenChange={(open) => {
              if (!open) setEditingExperience(null)
            }}
            userId={userId}
            initial={editingExperience}
            onSave={onExperienceSaved}
          />
        )}
      </CardContent>
    </Card>
  )
}
