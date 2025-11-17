"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Download, Lock, Sparkles, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, X } from "lucide-react"
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
  isOpen?: boolean
  onToggle?: () => void
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
  isOpen = true,
  onToggle,
}: ProfileCompletionWidgetProps) {
  const isLocked = !canDownloadResume
  const tone: StatusTone = statusTone ?? "info"

  const statusColors: Record<StatusTone, string> = {
    info: "text-blue-600 dark:text-blue-400",
    success: "text-emerald-600 dark:text-emerald-400",
    error: "text-red-600 dark:text-red-400",
  }

  const statusIcons = {
    info: Info,
    success: CheckCircle2,
    error: AlertCircle,
  }

  const StatusIcon = statusIcons[tone]

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Collapsed Toggle Button */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={onToggle}
            className="pointer-events-auto group relative flex items-center gap-3 rounded-full border border-border/50 bg-gradient-to-br from-card/98 via-card/95 to-card/98 pl-2 pr-4 py-2 shadow-xl backdrop-blur-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/5 via-transparent to-black/5" />
            <div className="relative flex items-center gap-3">
              {/* Progress Ring */}
              <div className="relative flex h-10 w-10 items-center justify-center">
                {/* Background circle */}
                <svg className="absolute h-10 w-10 -rotate-90 transform">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-muted/30"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    className={cn(
                      overallPercent >= 90 ? "text-emerald-500" : "text-orange-500"
                    )}
                    initial={{ strokeDasharray: "0 100" }}
                    animate={{ 
                      strokeDasharray: `${overallPercent} 100`,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
                {/* Percentage text */}
                <span className="relative text-xs font-bold text-foreground">
                  {overallPercent}%
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Profile
                </span>
                <span className="text-xs font-bold text-foreground">
                  {overallPercent >= 90 ? "Complete" : "In Progress"}
                </span>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-[-2px]" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Widget */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, height: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: "auto" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-[360px] max-w-[calc(100vw-2rem)]"
          >
            <motion.div 
              className="pointer-events-auto relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/98 via-card/95 to-card/98 p-5 shadow-2xl backdrop-blur-xl"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              {/* Subtle gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5" />
        
        {/* Content */}
        <div className="relative space-y-4">
          {/* Header with Close Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <motion.p 
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Profile Status
              </motion.p>
              <motion.div 
                className="mt-1 flex items-baseline gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent">
                  {overallPercent}%
                </span>
                <span className="text-xs font-medium text-muted-foreground">complete</span>
              </motion.div>
            </div>
            <div className="flex items-start gap-2">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold shadow-sm ring-1 ring-inset",
                  overallPercent >= 90
                    ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                    : "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
                )}
              >
                <Sparkles className="h-3 w-3" />
                {overallPercent >= 90 ? "🎉 Ready!" : "Keep going!"}
              </motion.span>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Main Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <ProgressBar value={overallPercent} />
          </motion.div>

          {/* Sections List */}
          <motion.div 
            className="custom-scrollbar max-h-[200px] space-y-2 overflow-y-auto pr-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="popLayout">
              {sections.map((section, index) => (
                <motion.button
                  key={section.id}
                  type="button"
                  onClick={() => onNavigate?.(section.targetSection)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex w-full items-center gap-3 rounded-xl border border-transparent bg-muted/30 px-3 py-2.5 text-left transition-all hover:border-border/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
                        {section.label}
                      </span>
                      <span className="text-xs font-bold tabular-nums text-foreground">
                        {section.percent}%
                      </span>
                    </div>
                    <ProgressBar value={section.percent} muted />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-2.5 pt-1"
          >
            <motion.div
              whileHover={!isLocked && !isDownloading ? { scale: 1.02 } : {}}
              whileTap={!isLocked && !isDownloading ? { scale: 0.98 } : {}}
            >
              <Button
                type="button"
                size="sm"
                className={cn(
                  "relative w-full overflow-hidden rounded-xl text-xs font-bold shadow-md transition-all duration-300",
                  isLocked
                    ? "border-2 border-dashed border-muted-foreground/30 bg-transparent text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/20"
                    : "bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-lg hover:shadow-xl dark:from-white dark:via-gray-100 dark:to-white dark:text-black",
                )}
                disabled={isLocked || isDownloading}
                onClick={() => onDownloadResume?.()}
              >
                {/* Button shine effect */}
                {!isLocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                )}
                
                <span className="relative flex items-center justify-center gap-2 py-0.5">
                  {isLocked ? (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Unlock at 90%</span>
                    </>
                  ) : (
                    <>
                      <Download className={cn("h-4 w-4", isDownloading && "animate-bounce")} />
                      <span>{isDownloading ? "Preparing PDF…" : "Download ATS Resume"}</span>
                    </>
                  )}
                </span>
              </Button>
            </motion.div>

            {/* Status Message */}
            <AnimatePresence mode="wait">
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-[11px] font-medium leading-relaxed",
                    statusColors[tone]
                  )}
                >
                  <StatusIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{statusMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ProgressBar = ({ value, muted = false }: { value: number; muted?: boolean }) => {
  const percentage = Math.min(100, Math.max(0, value))
  
  return (
    <div className={cn(
      "relative w-full overflow-hidden rounded-full bg-gradient-to-r from-muted via-muted to-muted/80",
      muted ? "h-1.5" : "h-2.5 shadow-inner"
    )}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "relative h-full rounded-full transition-all duration-500",
          muted 
            ? "bg-gradient-to-r from-foreground/70 via-foreground/80 to-foreground/70" 
            : "bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 shadow-md"
        )}
      >
        {/* Shine effect on progress bar */}
        {!muted && percentage > 0 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </div>
  )
}
