import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface DashboardSummaryProject {
  projectId: number
  projectName: string
  recentUpvotes: number
  totalUpvotes: number
}

interface DashboardSummaryDialogProps {
  open: boolean
  summaryProjects: DashboardSummaryProject[]
  summarySinceLabel: string | null
  onDismiss: () => void
}

export function DashboardSummaryDialog({
  open,
  summaryProjects,
  summarySinceLabel,
  onDismiss,
}: DashboardSummaryDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onDismiss()
        }
      }}
    >
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>Community updates</DialogTitle>
          <DialogDescription>
            {summarySinceLabel
              ? `Your projects received new upvotes since ${summarySinceLabel}.`
              : "Your projects recently received fresh upvotes from the community."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {summaryProjects.map((project) => (
            <div
              key={project.projectId}
              className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground line-clamp-2">
                  {project.projectName}
                </span>
                <span className="text-sm font-bold text-orange-600">
                  +{project.recentUpvotes}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Total upvotes: {project.totalUpvotes}
              </p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={onDismiss} className="ml-auto">
            Got it, thanks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
