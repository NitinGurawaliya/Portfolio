import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HomeNextButtonProps {
  onNavigate: () => void
}

export function HomeNextButton({ onNavigate }: HomeNextButtonProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40">
      <Button
        variant="default"
        size="sm"
        onClick={onNavigate}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-orange-400"
      >
        Next: Projects
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
