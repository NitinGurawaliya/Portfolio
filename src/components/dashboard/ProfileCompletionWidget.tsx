"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Download, Lock, Sparkles } from "lucide-react"
import { ProfileCompletionSection } from "@/lib/profile-completion"

interface ProfileCompletionWidgetProps {
  overallPercent: number
  sections: ProfileCompletionSection[]
  onNavigate?: (sectionId: string) => void
  canDownloadResume: boolean
  isDownloading?: boolean
  onDownloadResume?: () => void
  statusMessage?: string
  statusTone?: "info" | "success" | "error"
}

type StatusTone = "info" | "success" | "error"

export function ProfileCompletionWidget({
  overallPercent,
  sections,
  onNavigate,
  canDownloadResume,
  isDownloading,
  onDownloadResume,
  statusMessage,
  statusTone = "info",
}: ProfileCompletionWidgetProps) {
  const isLocked = !canDownloadResume
  const tone: StatusTone = statusTone ?? "info"

  const statusColors: Record<StatusTone, string> = {
    info: "text-muted-foreground",
    success: "text-emerald-600",
    error: "text-red-600",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="pointer-events-none fixed bottom-4 left-4 z-50 w-[320px] max-w-[calc(100vw-2rem)] text-xs sm:text-sm"
    >
      <div className="pointer-events-auto space-y-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Profile completion</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-foreground">{overallPercent}%</span>
              <span className="text-[11px] text-muted-foreground">done</span>
            </div>
          </div>
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold",
              overallPercent >= 90
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {overallPercent >= 90 ? "Ready" : "Keep going"}
          </span>
        </div>

        <ProgressBar value={overallPercent} />

        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onNavigate?.(section.targetSection)}
              className="group flex w-full items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-left transition hover:border-border"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between text-[12px] font-medium">
                  <span className="text-muted-foreground group-hover:text-foreground">{section.label}</span>
                  <span className="font-semibold text-foreground">{section.percent}%</span>
                </div>
                <ProgressBar value={section.percent} muted />
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant={isLocked ? "outline" : "default"}
            size="sm"
            className={cn(
              "w-full rounded-xl text-xs font-semibold transition",
              isLocked
                ? "border-dashed border-border text-muted-foreground"
                : "bg-black text-white hover:bg-black/90",
            )}
            disabled={isLocked || isDownloading}
            onClick={() => onDownloadResume?.()}
          >
            {isLocked ? (
              <>
                <Lock className="mr-2 h-3.5 w-3.5" />
                Unlock at 90%
              </>
            ) : (
              <>
                <Download className="mr-2 h-3.5 w-3.5" />
                {isDownloading ? "Preparing ATS PDF…" : "Download ATS resume"}
              </>
            )}
          </Button>
          {statusMessage && (
            <p className={cn("text-[11px] leading-snug", statusColors[tone])}>{statusMessage}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const ProgressBar = ({ value, muted = false }: { value: number; muted?: boolean }) => {
  return (
    <div className={cn("h-2 w-full rounded-full bg-muted", muted && "h-1.5")}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-200",
          muted && "from-black/70 to-black",
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
