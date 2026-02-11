"use client"

import { ProjectBasicInfoSection } from "@/components/dashboard/projects/ProjectBasicInfoSection"
import { ProjectInsightsSection } from "@/components/dashboard/projects/ProjectInsightsSection"
import type { ProjectInsightsPayload, RepositoryLike } from "@/components/dashboard/projects/types"
import { Button } from "@/components/ui/button"
import { useProjectImport } from "@/hooks/useProjectImport"
import { X } from "lucide-react"

interface AddProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repositories: RepositoryLike[]
  selectedRepos?: number[]
  onAddImportedProject: (project: RepositoryLike) => void
  onCaptureInsights?: (repoId: number, insights: ProjectInsightsPayload) => void
}

export type { ProjectInsightsPayload, RepositoryLike } from "@/components/dashboard/projects/types"

export function AddProjectModal({
  open,
  onOpenChange,
  repositories,
  selectedRepos = [],
  onAddImportedProject,
  onCaptureInsights,
}: AddProjectModalProps) {
  const projectImport = useProjectImport({
    open,
    repositories,
    selectedRepos,
    onAddImportedProject,
    onCaptureInsights,
    onOpenChange,
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-gray-600 bg-background shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
            <div>
              <div className="text-xl font-bold">Add new project</div>
              <div className="text-xs text-gray-500">Add a link and enhance your project details</div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <ProjectBasicInfoSection
              filteredRepos={projectImport.filteredRepos}
              githubSearchQuery={projectImport.githubSearchQuery}
              onGithubSearchQueryChange={projectImport.setGithubSearchQuery}
              onSelectGithubRepo={projectImport.handleAddByGithub}
              projectUrl={projectImport.projectUrl}
              onProjectUrlChange={projectImport.setProjectUrl}
              isLoading={projectImport.isLoading}
              title={projectImport.title}
              onTitleChange={projectImport.setTitle}
              description={projectImport.description}
              onDescriptionChange={projectImport.setDescription}
              favicon={projectImport.favicon}
              logo={projectImport.logo}
              imageLoading={projectImport.imageLoading}
              imageLoadError={projectImport.imageLoadError}
              onImageLoadStart={projectImport.handleImageLoadStart}
              onImageLoad={projectImport.handleImageLoad}
              onImageError={projectImport.handleImageError}
              onUploadImage={projectImport.handleUploadImage}
            />

            <ProjectInsightsSection
              activeMetric={projectImport.activeMetric}
              onActiveMetricChange={projectImport.setActiveMetric}
              categories={projectImport.categories}
              onCategoriesChange={projectImport.setCategories}
              status={projectImport.status}
              onStatusChange={projectImport.setStatus}
              revenueInput={projectImport.revenueInput}
              onRevenueInputChange={projectImport.setRevenueInput}
              mrrInput={projectImport.mrrInput}
              onMrrInputChange={projectImport.setMrrInput}
              usersInput={projectImport.usersInput}
              onUsersInputChange={projectImport.setUsersInput}
              technologies={projectImport.technologies}
              onTechnologiesChange={projectImport.setTechnologies}
            />
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background px-6 py-4">
            <div className="mr-auto text-xs text-gray-500">
              {projectImport.isLoading ? "Fetching metadata..." : " "}
            </div>

            <Button onClick={() => onOpenChange(false)} variant="secondary" className="rounded-lg">
              Cancel
            </Button>

            <Button
              onClick={projectImport.handleDone}
              disabled={projectImport.isLoading || !projectImport.title.trim() || !projectImport.projectUrl.trim()}
              className="rounded-lg bg-black text-white disabled:opacity-60"
            >
              Save Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
