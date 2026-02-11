import { Input } from "@/components/ui/input"
import { TechStackSelector } from "@/components/ui/TechStackSelector"
import { cn } from "@/lib/utils"
import { CATEGORY_OPTIONS, PROJECT_METRICS, STATUS_OPTIONS, type ProjectMetricId } from "./types"

interface ProjectInsightsSectionProps {
  activeMetric: ProjectMetricId | null
  onActiveMetricChange: (value: ProjectMetricId | null) => void
  categories: string[]
  onCategoriesChange: (next: string[]) => void
  status: string
  onStatusChange: (value: string) => void
  revenueInput: string
  onRevenueInputChange: (value: string) => void
  mrrInput: string
  onMrrInputChange: (value: string) => void
  usersInput: string
  onUsersInputChange: (value: string) => void
  technologies: string[]
  onTechnologiesChange: (next: string[]) => void
}

export function ProjectInsightsSection({
  activeMetric,
  onActiveMetricChange,
  categories,
  onCategoriesChange,
  status,
  onStatusChange,
  revenueInput,
  onRevenueInputChange,
  mrrInput,
  onMrrInputChange,
  usersInput,
  onUsersInputChange,
  technologies,
  onTechnologiesChange,
}: ProjectInsightsSectionProps) {
  const hasMetricValue = (metricId: ProjectMetricId) => {
    if (metricId === "category") return categories.length > 0
    if (metricId === "techstack") return technologies.length > 0
    if (metricId === "status") return Boolean(status)
    if (metricId === "revenue") return Boolean(revenueInput)
    if (metricId === "mrr") return Boolean(mrrInput)
    if (metricId === "users") return Boolean(usersInput)
    return false
  }

  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-sm font-semibold text-gray-900">Project Insights (Optional)</h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {PROJECT_METRICS.map((metric) => {
          const Icon = metric.icon
          const isActive = activeMetric === metric.id
          const hasValue = hasMetricValue(metric.id)

          return (
            <div key={metric.id} className="space-y-2">
              <button
                type="button"
                onClick={() => onActiveMetricChange(isActive ? null : metric.id)}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all duration-200",
                  "hover:border-gray-400",
                  isActive && "border-black bg-black/5",
                  hasValue && "border-green-300 bg-green-50"
                )}
              >
                <Icon className={cn("h-6 w-6", hasValue ? "text-green-600" : "text-gray-500")} />
                <span className="text-xs font-medium text-gray-700">{metric.label}</span>
                {hasValue && <span className="text-[10px] text-green-600">Added</span>}
              </button>

              {isActive && (
                <div className="space-y-1.5">
                  {metric.id === "category" && (
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-input bg-background p-2">
                      {CATEGORY_OPTIONS.map((option) => (
                        <label key={option} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
                          <input
                            type="checkbox"
                            checked={categories.includes(option)}
                            onChange={(event) => {
                              if (event.target.checked) {
                                onCategoriesChange([...categories, option])
                                return
                              }

                              onCategoriesChange(categories.filter((value) => value !== option))
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {metric.id === "techstack" && (
                    <TechStackSelector selectedTechs={technologies} onChange={onTechnologiesChange} />
                  )}

                  {metric.id === "status" && (
                    <select
                      value={status}
                      onChange={(event) => onStatusChange(event.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                      autoFocus
                    >
                      <option value="">Select status</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {metric.id === "revenue" && (
                    <Input
                      type="number"
                      min={0}
                      value={revenueInput}
                      onChange={(event) => onRevenueInputChange(event.target.value)}
                      placeholder="e.g. 50000"
                      className="h-10 rounded-lg"
                      autoFocus
                    />
                  )}

                  {metric.id === "mrr" && (
                    <Input
                      type="number"
                      min={0}
                      value={mrrInput}
                      onChange={(event) => onMrrInputChange(event.target.value)}
                      placeholder="e.g. 4500"
                      className="h-10 rounded-lg"
                      autoFocus
                    />
                  )}

                  {metric.id === "users" && (
                    <Input
                      type="number"
                      min={0}
                      value={usersInput}
                      onChange={(event) => onUsersInputChange(event.target.value)}
                      placeholder="e.g. 1200"
                      className="h-10 rounded-lg"
                      autoFocus
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
