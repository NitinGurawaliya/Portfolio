import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md",
        // Light mode: subtle gray shimmer
        "bg-gray-200",
        // Dark mode: deeper gray shimmer
        "dark:bg-gray-700",
        className
      )}
      style={{ opacity: 0.6 }}
      {...props}
    />
  )
}

export { Skeleton }
