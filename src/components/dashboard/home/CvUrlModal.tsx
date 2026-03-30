import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CvUrlModalProps {
  open: boolean
  isEditing: boolean
  value: string
  onChange: (value: string) => void
  onClose: () => void
  onSave: () => void
}

export function CvUrlModal({
  open,
  isEditing,
  value,
  onChange,
  onClose,
  onSave,
}: CvUrlModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[720px] max-w-full rounded-xl bg-white shadow-2xl border border-gray-200">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <div className="text-xl text-black font-bold">{isEditing ? "Edit CV/Resume" : "Add CV/Resume"}</div>
              <div className="text-xs text-gray-500">
                Enter the URL to your CV or Resume. Users will be able to download it from your portfolio.
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cvUrl" className="text-black font-medium">
                CV/Resume URL
              </Label>
              <Input
                id="cvUrl"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://example.com/cv.pdf"
                className="bg-gray-50 text-black focus:bg-white"
              />
              <p className="text-xs text-gray-500">Paste a direct link to your CV or Resume PDF</p>
            </div>
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="bg-white text-black border-gray-300">
              Cancel
            </Button>
            <Button onClick={onSave} className="bg-black text-white hover:bg-gray-800">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
