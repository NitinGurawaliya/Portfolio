"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const ratingEmojis = [
  { emoji: "😔", value: "disappointed", label: "Disappointed" },
  { emoji: "😐", value: "okay", label: "Okay" },
  { emoji: "👌", value: "good", label: "Good" },
  { emoji: "👍", value: "great", label: "Great" },
  { emoji: "🔥", value: "amazing", label: "Amazing" },
]

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [selectedRating, setSelectedRating] = useState<string>("")
  const [experience, setExperience] = useState("")
  const [features, setFeatures] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedRating) {
      toast.error("कृपया एक rating चुनें")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: selectedRating,
          experience: experience.trim(),
          features: features.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Feedback submit करने में समस्या हुई")
      }

      toast.success("आपका feedback सफलतापूर्वक submit हो गया! धन्यवाद! 🎉")
      
      // Reset form
      setSelectedRating("")
      setExperience("")
      setFeatures("")
      onClose()
    } catch (error) {
      console.error("Feedback submission error:", error)
      toast.error("कुछ गलत हो गया। कृपया फिर से कोशिश करें।")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] rounded-3xl border-0 bg-white p-8 shadow-2xl sm:max-w-[600px] dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Help us improve
          </DialogTitle>
          <DialogDescription className="mt-2 text-base text-gray-600 dark:text-gray-400">
            How would you like to describe your experience with our Application?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Rating Emojis */}
          <div className="flex items-center justify-between gap-2">
            {ratingEmojis.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSelectedRating(item.value)}
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-4xl transition-all duration-200 hover:scale-110 sm:h-20 sm:w-20",
                  selectedRating === item.value
                    ? "border-blue-500 bg-blue-50 shadow-lg dark:border-blue-400 dark:bg-blue-900/30"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                )}
                aria-label={item.label}
              >
                {item.emoji}
              </button>
            ))}
          </div>

          {/* Overall Experience */}
          <div className="space-y-3">
            <label className="text-base font-medium text-gray-700 dark:text-gray-300">
              What&apos;s your overall experience?
            </label>
            <Textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Please share your thoughts..."
              className="min-h-[120px] resize-none rounded-2xl border-gray-200 bg-gray-50 text-base placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Feature Requests */}
          <div className="space-y-3">
            <label className="text-base font-medium text-gray-700 dark:text-gray-300">
              What other features would you like to see?
            </label>
            <Textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Please share your thoughts..."
              className="min-h-[120px] resize-none rounded-2xl border-gray-200 bg-gray-50 text-base placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-gray-300 py-6 text-base font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedRating}
              className="flex-1 rounded-xl bg-blue-600 py-6 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
