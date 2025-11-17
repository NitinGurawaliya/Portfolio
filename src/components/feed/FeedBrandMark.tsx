import { cn } from "@/lib/utils"

interface FeedBrandMarkProps {
  className?: string
}

export function FeedBrandMark({ className }: FeedBrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm sm:h-9 sm:w-9">
        <span className="text-xs font-bold text-white sm:text-base">D</span>
      </div>
      <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-base font-bold text-transparent sm:text-lg">
        DevFolio
      </span>
    </div>
  )
}

