import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProjectIcon } from "@/components/ui/project-icon"
import { IndividualProjectChart } from "@/components/IndividualProjectChart"
import { SkillIcon, getSkillIcon } from "@/lib/skill-icons"
import { Star, GitFork, Trash2, Loader2, Sparkles, MoreVertical } from "lucide-react"
import { getLanguageColor } from "@/lib/repos/repos-utils"
import type { Dispatch, SetStateAction } from "react"
import type { PortfolioRepository, RepoEditInitial } from "./types"

type ChartPeriod = "week" | "month" | "year"

type AnalyticsWithProjects = {
  detailed?: {
    projects?: Array<{
      projectId: number
      totalViews: number
    }>
  }
}

interface SelectedReposGridProps {
  selectedRepositories: PortfolioRepository[]
  customNames: Record<number, string>
  customDescriptions: Record<number, string>
  projectCategoriesState: Record<number, string>
  projectStatusesState: Record<number, string>
  projectRevenuesState: Record<number, number>
  projectMrrsState: Record<number, number>
  projectUsersState: Record<number, number>
  customTechnologies: Record<number, string>
  logoOverrides: Record<number, string>
  deletingRepoIds: Record<number, boolean>
  chartPeriods: Record<number, ChartPeriod>
  setChartPeriods: Dispatch<SetStateAction<Record<number, ChartPeriod>>>
  portfolioId?: number
  analytics?: unknown
  deployedUrls: Record<number, string>
  onRemoveRepo: (repoId: number, portfolioRepoId?: number) => void
  onOpenEdit: (initial: RepoEditInitial) => void
}

function resolveProjectViews(analytics: unknown, portfolioRepositoryId?: number): number {
  const projects = (analytics as AnalyticsWithProjects | undefined)?.detailed?.projects
  if (!projects || !portfolioRepositoryId) return 0
  const project = projects.find((p) => p.projectId === portfolioRepositoryId)
  return project?.totalViews ?? 0
}

function buildEditInitial(
  repo: PortfolioRepository,
  customName: string,
  customDescription: string,
  deployedUrls: Record<number, string>,
  logoOverrides: Record<number, string>,
  projectCategoriesState: Record<number, string>,
  projectStatusesState: Record<number, string>,
  projectRevenuesState: Record<number, number>,
  projectMrrsState: Record<number, number>,
  projectUsersState: Record<number, number>,
  customTechnologies: Record<number, string>
): RepoEditInitial {
  const url = deployedUrls[repo.id] || repo.htmlUrl
  return {
    id: repo.id,
    url: url || "",
    name: customName || repo.name,
    description: customDescription || repo.description,
    logo: logoOverrides[repo.id] ?? repo.repository.logo,
    category: projectCategoriesState[repo.id] || "",
    status: projectStatusesState[repo.id] || "",
    revenue: projectRevenuesState[repo.id] ?? null,
    mrr: projectMrrsState[repo.id] ?? null,
    users: projectUsersState[repo.id] ?? null,
    technologies: customTechnologies[repo.id] || null,
  }
}

export function SelectedReposGrid({
  selectedRepositories,
  customNames,
  customDescriptions,
  projectCategoriesState,
  projectStatusesState,
  projectRevenuesState,
  projectMrrsState,
  projectUsersState,
  customTechnologies,
  logoOverrides,
  deletingRepoIds,
  chartPeriods,
  setChartPeriods,
  portfolioId,
  analytics,
  deployedUrls,
  onRemoveRepo,
  onOpenEdit,
}: SelectedReposGridProps) {
  if (selectedRepositories.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4 }}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 md:gap-3">
          <AnimatePresence mode="popLayout">
            {selectedRepositories.map((repo) => {
              const customName = customNames[repo.id] || repo.name
              const customDescription = customDescriptions[repo.id] || repo.description
              const categoryValue = projectCategoriesState[repo.id]
              const statusValue = projectStatusesState[repo.id]
              const revenueValue = projectRevenuesState[repo.id]
              const mrrValue = projectMrrsState[repo.id]
              const usersValue = projectUsersState[repo.id]
              const hasRevenue = typeof revenueValue === "number"
              const hasMrr = typeof mrrValue === "number"
              const hasUsers = typeof usersValue === "number"

              return (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  layout
                  layoutId={`repo-${repo.id}`}
                >
                  <Card
                    className="hover:border-gray-600 transition-all duration-300 group h-[420px] relative bg-background"
                    style={{ overflow: "visible" }}
                  >
                    <CardContent className="p-0 h-full" style={{ overflow: "visible" }}>
                      <div className="flex flex-col h-full px-3 py-2.5 relative" style={{ overflow: "visible" }}>
                        <motion.div
                          className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          initial={{ opacity: 0 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            onClick={() => onRemoveRepo(repo.id, repo.portfolioRepositoryId)}
                            variant="destructive"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full shadow-md hover:shadow-lg"
                            disabled={Boolean(deletingRepoIds[repo.id])}
                          >
                            {deletingRepoIds[repo.id] ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </motion.div>

                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 md:gap-3 min-w-0">
                            <ProjectIcon
                              favicon={repo.repository.favicon}
                              logo={logoOverrides[repo.id] ?? repo.repository.logo}
                              title={customName || repo.name}
                              size="md"
                              className="flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h3 className="text-[13px] font-semibold text-gray-900 truncate dark:text-white">
                                {customName}
                              </h3>
                              <p className="text-[11px] text-gray-500 truncate">
                                {customDescription}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 flex-shrink-0">
                            <div className="text-right leading-tight">
                              <div className="text-[10px] text-gray-500">Times visited</div>
                              <div className="text-[13px] font-semibold text-black">
                                {resolveProjectViews(analytics, repo.portfolioRepositoryId)}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="h-6 w-6 grid place-items-center rounded-md hover:bg-gray-100">
                                  <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-36">
                                <DropdownMenuItem
                                  onClick={() =>
                                    onOpenEdit(
                                      buildEditInitial(
                                        repo,
                                        customName,
                                        customDescription,
                                        deployedUrls,
                                        logoOverrides,
                                        projectCategoriesState,
                                        projectStatusesState,
                                        projectRevenuesState,
                                        projectMrrsState,
                                        projectUsersState,
                                        customTechnologies
                                      )
                                    )
                                  }
                                >
                                  Edit Project
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={Boolean(deletingRepoIds[repo.id])}
                                  onClick={() => onRemoveRepo(repo.id, repo.portfolioRepositoryId)}
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {(statusValue || hasUsers) && (
                          <div className="mt-1.5 mb-1.5 flex flex-wrap items-center gap-1.5">
                            {statusValue && (
                              <span className="inline-flex items-center text-[9px] leading-none font-medium rounded px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200">
                                {statusValue}
                              </span>
                            )}
                            {hasUsers && (
                              <span className="inline-flex items-center text-[9px] leading-none font-medium rounded px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200">
                                Users: {usersValue >= 1000 ? `${(usersValue / 1000).toFixed(1)}k` : usersValue}
                              </span>
                            )}
                          </div>
                        )}

                        {categoryValue && (
                          <div className="mt-1.5 mb-1.5 flex flex-wrap items-center gap-1">
                            {categoryValue.split(",").map((cat: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center text-[9px] leading-none font-medium rounded px-1.5 py-0.5 bg-gray-100 text-gray-700 border border-gray-200">
                                {cat.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {(hasRevenue || hasMrr) && (
                          <div className="mt-1.5 mb-2 flex flex-wrap items-center gap-1.5">
                            {hasRevenue && (
                              <span className="inline-flex items-center text-[9px] leading-none font-medium rounded px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                                ARR: ${(revenueValue / 1000).toFixed(1)}k
                              </span>
                            )}
                            {hasMrr && (
                              <span className="inline-flex items-center text-[9px] leading-none font-medium rounded px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200">
                                MRR: ${(mrrValue / 1000).toFixed(1)}k
                              </span>
                            )}
                          </div>
                        )}

                        {!statusValue && !categoryValue && !hasRevenue && !hasMrr && !hasUsers && !customTechnologies[repo.id] && (
                          <div className="mt-1.5 mb-2 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-md">
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-blue-900 mb-0.5">
                                  Enhance your project
                                </p>
                                <p className="text-[9px] text-blue-700 leading-tight">
                                  Add status, tech stack, and metrics to make your project stand out
                                </p>
                                <button
                                  onClick={() =>
                                    onOpenEdit(
                                      buildEditInitial(
                                        repo,
                                        customName,
                                        customDescription,
                                        deployedUrls,
                                        logoOverrides,
                                        projectCategoriesState,
                                        projectStatusesState,
                                        projectRevenuesState,
                                        projectMrrsState,
                                        projectUsersState,
                                        customTechnologies
                                      )
                                    )
                                  }
                                  className="mt-1.5 text-[9px] font-semibold text-blue-600 hover:text-blue-700 underline"
                                >
                                  Add details →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-1.5 mb-2 flex flex-wrap items-center gap-2 text-[10px]">
                          {(repo.repository.language || repo.language) && (
                            <div className="inline-flex items-center gap-1">
                              <div className={`h-2 w-2 rounded-full ${getLanguageColor(repo.repository.language || repo.language)}`} />
                              <span className="text-gray-600">{repo.repository.language || repo.language}</span>
                            </div>
                          )}

                          {(repo.repository.stargazersCount > 0 || repo.repository.forksCount > 0) && (
                            <div className="inline-flex items-center gap-2 text-gray-600">
                              {repo.repository.stargazersCount > 0 && (
                                <div className="inline-flex items-center gap-0.5">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{repo.repository.stargazersCount >= 1000 ? `${(repo.repository.stargazersCount / 1000).toFixed(1)}k` : repo.repository.stargazersCount}</span>
                                </div>
                              )}
                              {repo.repository.forksCount > 0 && (
                                <div className="inline-flex items-center gap-0.5">
                                  <GitFork className="h-3 w-3" />
                                  <span>{repo.repository.forksCount >= 1000 ? `${(repo.repository.forksCount / 1000).toFixed(1)}k` : repo.repository.forksCount}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {customTechnologies[repo.id] && (
                          <div className="mt-1.5 mb-2">
                            <div className="flex flex-wrap gap-1.5">
                              {customTechnologies[repo.id].split(",").map((tech: string, idx: number) => {
                                const techName = tech.trim()
                                const IconComponent = getSkillIcon(techName)
                                return (
                                  <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-medium rounded-md px-1.5 py-1 bg-slate-100 text-slate-700 border border-slate-200">
                                    {IconComponent ? (
                                      <SkillIcon skillName={techName} className="h-3 w-3" />
                                    ) : null}
                                    <span>{techName}</span>
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {portfolioId ? (
                          <div className="mt-auto flex-shrink-0" style={{ height: "180px", minHeight: "180px", overflow: "visible" }}>
                            <div className="flex items-center justify-end gap-1 mb-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setChartPeriods((prev) => ({ ...prev, [repo.id]: "week" }))}
                                className={`h-6 px-2 text-[10px] ${
                                  (chartPeriods[repo.id] || "week") === "week"
                                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                              >
                                1W
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setChartPeriods((prev) => ({ ...prev, [repo.id]: "month" }))}
                                className={`h-6 px-2 text-[10px] ${
                                  (chartPeriods[repo.id] || "week") === "month"
                                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                              >
                                1M
                              </Button>
                            </div>
                            <div className="w-full" style={{ overflow: "visible" }}>
                              <IndividualProjectChart
                                portfolioId={portfolioId}
                                projectId={repo.portfolioRepositoryId || repo.id}
                                projectName={customName || repo.repository.name}
                                size="sm"
                                className="w-full"
                                period={chartPeriods[repo.id] as "week" | "month" | undefined}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 flex-1 flex flex-col">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                              <div className="text-xs text-gray-400 text-center px-2">
                                Loading portfolio...
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
