import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

interface ThemePreviewModalProps {
  previewImage: string | null
  onClose: () => void
}

export function ThemePreviewModal({ previewImage, onClose }: ThemePreviewModalProps) {
  return (
    <AnimatePresence>
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-h-[85vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Theme preview" className="h-full w-full rounded-lg object-contain" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
