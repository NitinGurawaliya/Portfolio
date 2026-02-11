"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { AddProjectModal } from "./AddProjectModal"
import { EditProjectModal as EditModal } from "./EditProjectModal"
import { ReposSectionHeader } from "@/components/dashboard/repos/ReposSectionHeader"
import { SelectedReposGrid } from "@/components/dashboard/repos/SelectedReposGrid"
import { ReposLoadingSkeleton } from "@/components/dashboard/repos/ReposLoadingSkeleton"
import { ReposEmptyState } from "@/components/dashboard/repos/ReposEmptyState"
import { useReposManagement } from "@/hooks/useReposManagement"
import type { ReposSectionProps } from "@/components/dashboard/repos/types"
import type { RepositoryLike } from "./AddProjectModal"

const normalizeImportedProject = (project: RepositoryLike): ReposSectionProps["repositories"][number] => {
  const now = new Date().toISOString()

  return {
    id: project.id,
    portfolioRepositoryId: undefined,
    name: project.name || "Untitled Project",
    fullName: project.fullName || project.name || "imported/project",
    description: project.description || "",
    htmlUrl: project.htmlUrl || "",
    homepage: project.homepage || "",
    language: project.language || "",
    languages: project.languages || [],
    stargazersCount: project.stargazersCount ?? 0,
    forksCount: project.forksCount ?? 0,
    isPrivate: project.isPrivate ?? false,
    isFork: project.isFork ?? false,
    size: project.size ?? 0,
    createdAt: project.createdAt || now,
    updatedAt: project.updatedAt || now,
    pushedAt: project.pushedAt || project.updatedAt || now,
    isImported: project.isImported ?? true,
    favicon: project.favicon ?? undefined,
    logo: project.logo ?? undefined,
    siteName: undefined,
    keywords: undefined,
    author: undefined,
  }
}

export function ReposSection({
  repositories,
  selectedRepos,
  deployedUrls: initialDeployedUrls,
  customNames: initialCustomNames,
  customDescriptions: initialCustomDescriptions,
  projectCategories: initialProjectCategories,
  projectStatuses: initialProjectStatuses,
  projectRevenues: initialProjectRevenues,
  projectMrrs: initialProjectMrrs,
  projectUsers: initialProjectUsers,
  projectTechnologies: initialProjectTechnologies,
  repoOrder: initialRepoOrder,
  onToggleRepo,
  onUpdateDeployedUrl,
  onUpdateCustomName,
  onUpdateCustomDescription,
  onUpdateProjectCategory,
  onUpdateProjectStatus,
  onUpdateProjectRevenue,
  onUpdateProjectMrr,
  onUpdateProjectUsers,
  onUpdateProjectTechnologies,
  onUpdateRepoOrder,
  onAddImportedProject,
  analytics,
  portfolioId,
  onUpdateLogo,
  logoOverrides: initialLogoOverrides,
  isLoading = false,
  onNavigateToSection,
}: ReposSectionProps) {
  const {
    deployedUrls,
    customNames,
    customDescriptions,
    projectCategoriesState,
    projectStatusesState,
    projectRevenuesState,
    projectMrrsState,
    projectUsersState,
    customTechnologies,
    isAddProjectOpen,
    setIsAddProjectOpen,
    isEditOpen,
    setIsEditOpen,
    editInitial,
    setEditInitial,
    logoOverrides,
    deletingRepoIds,
    chartPeriods,
    setChartPeriods,
    selectedRepositories,
    handleCapturedInsights,
    handleRemoveRepo,
    handleEditModalSave,
  } = useReposManagement({
    repositories,
    selectedRepos,
    initialDeployedUrls,
    initialCustomNames,
    initialCustomDescriptions,
    initialProjectCategories,
    initialProjectStatuses,
    initialProjectRevenues,
    initialProjectMrrs,
    initialProjectUsers,
    initialProjectTechnologies,
    initialRepoOrder,
    initialLogoOverrides,
    onToggleRepo,
    onUpdateRepoOrder,
    onUpdateDeployedUrl,
    onUpdateCustomName,
    onUpdateCustomDescription,
    onUpdateProjectCategory,
    onUpdateProjectStatus,
    onUpdateProjectRevenue,
    onUpdateProjectMrr,
    onUpdateProjectUsers,
    onUpdateProjectTechnologies,
    onUpdateLogo,
    portfolioId,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="space-y-2 px-6 md:px-10 mt-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Tip banner removed */}

      <ReposSectionHeader onAddProject={() => setIsAddProjectOpen(true)} />

      <SelectedReposGrid
        selectedRepositories={selectedRepositories}
        customNames={customNames}
        customDescriptions={customDescriptions}
        projectCategoriesState={projectCategoriesState}
        projectStatusesState={projectStatusesState}
        projectRevenuesState={projectRevenuesState}
        projectMrrsState={projectMrrsState}
        projectUsersState={projectUsersState}
        customTechnologies={customTechnologies}
        logoOverrides={logoOverrides}
        deletingRepoIds={deletingRepoIds}
        chartPeriods={chartPeriods}
        setChartPeriods={setChartPeriods}
        portfolioId={portfolioId}
        analytics={analytics}
        deployedUrls={deployedUrls}
        onRemoveRepo={handleRemoveRepo}
        onOpenEdit={(initial) => {
          setEditInitial(initial)
          setIsEditOpen(true)
        }}
      />

      {onNavigateToSection && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40">
          <Button
            variant="default"
            size="sm"
            onClick={() => onNavigateToSection("skills")}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            Next: Skills
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {isLoading && selectedRepositories.length === 0 && <ReposLoadingSkeleton />}

      {!isLoading && selectedRepositories.length === 0 && (
        <ReposEmptyState
          onBrowseGitHub={() => setIsAddProjectOpen(true)}
          variants={itemVariants}
        />
      )}
      <AddProjectModal
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
        repositories={repositories}
        selectedRepos={selectedRepos}
        onAddImportedProject={(project) => {
          if (!onAddImportedProject) return
          onAddImportedProject(normalizeImportedProject(project))
        }}
        onCaptureInsights={handleCapturedInsights}
      />

      {editInitial && (
        <EditModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          initial={editInitial}
          onSave={handleEditModalSave}
        />
      )}
    </motion.div>
  )
}