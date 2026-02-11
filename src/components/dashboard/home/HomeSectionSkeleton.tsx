import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function HomeSectionSkeleton() {
  return (
    <div className="space-y-2 px-4 sm:px-6 md:px-10">
      <div className="-mt-6 md:-mt-8">
        <Skeleton className="h-8 w-32 mb-4" />
      </div>

      <Card className="bg-white shadow-none border-none">
        <CardContent className="py-1 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-none border-none">
        <CardContent className="pt-4 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
