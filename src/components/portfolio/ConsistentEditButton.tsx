"use client"

import { Edit2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConsistentEditButtonProps {
  onClick: () => void
  label: string
  icon?: "edit" | "add"
  className?: string
}

export function ConsistentEditButton({
  onClick,
  label,
  icon = "edit",
  className,
}: ConsistentEditButtonProps) {
  const Icon = icon === "edit" ? Edit2 : Plus

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "fixed z-[10000] bg-white/95 backdrop-blur-sm border border-gray-300 rounded-md shadow-md hover:shadow-lg",
        "px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900",
        "flex items-center gap-1.5 transition-all hover:bg-white",
        "hover:scale-105 active:scale-95",
        className
      )}
      style={{ position: 'relative' }}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span>{label}</span>
    </button>
  )
}

