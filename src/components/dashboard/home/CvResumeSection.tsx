import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Pencil, Plus, Trash2 } from "lucide-react"

interface CvResumeSectionProps {
  cvUrl: string | null | undefined
  onAddClick: () => void
  onEditClick: () => void
  onRemoveClick: () => void
}

export function CvResumeSection({
  cvUrl,
  onAddClick,
  onEditClick,
  onRemoveClick,
}: CvResumeSectionProps) {
  const hasCv = Boolean(cvUrl)

  return (
    <Card className="bg-white dark:bg-background shadow-none border-card/80">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900 dark:text-gray-100">CV/Resume</div>
          <Button
            type="button"
            onClick={onAddClick}
            disabled={hasCv}
            className={`h-8 px-3 text-xs ${hasCv ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}
          >
            <Plus className="h-4 w-4" />
            Add CV
          </Button>
        </div>

        <div className="space-y-3">
          {hasCv && (
            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 bg-white shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-700" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-black mb-0.5">CV Document</div>
                <div className="text-xs text-gray-500 truncate">{cvUrl}</div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEditClick}
                  className="h-8 w-8 p-0 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <Pencil className="h-4 w-4 text-gray-700" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveClick}
                  className="h-8 w-8 p-0 rounded-lg bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          )}

          {!hasCv && <div className="text-xs text-gray-500">No CV/Resume added yet.</div>}
        </div>
      </CardContent>
    </Card>
  )
}
