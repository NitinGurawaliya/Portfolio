"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban } from "lucide-react"
import { AddProjectModal } from "@/components/dashboard/AddProjectModal"
import type { Repository } from "@/interface"

interface PortfolioProjectsSectionProps {
  selectedRepos: number[]
  allRepositories: Repository[]
  onAddProject: (project: Repository) => void
  onReposChange: (repos: number[]) => void
}

export function PortfolioProjectsSection({
  selectedRepos,
  allRepositories,
  onAddProject,
  onReposChange,
}: PortfolioProjectsSectionProps) {
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)

  const selectedProjects = allRepositories.filter(repo => selectedRepos.includes(repo.id))
  
  // Debug logging
  console.log("🔍 PortfolioProjectsSection:", {
    selectedRepos,
    selectedReposCount: selectedRepos.length,
    allRepositoriesCount: allRepositories.length,
    allRepositoriesIds: allRepositories.map(r => r.id),
    selectedProjectsCount: selectedProjects.length,
    selectedProjectsNames: selectedProjects.map(p => p.name)
  })

  const handleProjectAdded = (project: any) => {
    onAddProject(project)
    if (!selectedRepos.includes(project.id)) {
      onReposChange([...selectedRepos, project.id])
    }
    setIsAddProjectOpen(false)
  }

  return (
    <>
      <div className="bg-white py-6 px-6">
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-orange-500" />
              Projects
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddProjectOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Project
            </Button>
          </div>
        </div>
        <div>
          {selectedProjects.length > 0 ? (
            <div className="space-y-3">
              {selectedProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {project.name}
                    </h4>
                    {project.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReposChange(selectedRepos.filter(id => id !== project.id))}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No projects added yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "Add Project" to get started
              </p>
            </div>
          )}
        </div>
      </div>

      <AddProjectModal
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
        repositories={allRepositories}
        onAddImportedProject={handleProjectAdded}
      />
    </>
  )
}

