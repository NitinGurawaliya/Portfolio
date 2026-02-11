"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Check, Copy, Share2 } from "lucide-react"
import { FaFacebookF, FaLinkedinIn, FaRedditAlien, FaTwitter, FaWhatsapp } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import type { IconType } from "react-icons"
import { cn } from "@/lib/utils"
import { devWarn } from "@/lib/logger"

type ShareTarget = "native" | "facebook" | "whatsapp" | "twitter" | "linkedin" | "reddit" | "email"

const shareOptions: Array<{
  id: ShareTarget
  label: string
  bg: string
  icon: IconType
}> = [
  { id: "native", label: "Share", bg: "bg-neutral-900", icon: Share2 },
  { id: "facebook", label: "Facebook", bg: "bg-[#1877F2]", icon: FaFacebookF },
  { id: "whatsapp", label: "WhatsApp", bg: "bg-[#25D366]", icon: FaWhatsapp },
  { id: "twitter", label: "Twitter", bg: "bg-[#1DA1F2]", icon: FaTwitter },
  { id: "linkedin", label: "LinkedIn", bg: "bg-[#0A66C2]", icon: FaLinkedinIn },
  { id: "reddit", label: "Reddit", bg: "bg-[#FF4500]", icon: FaRedditAlien },
  { id: "email", label: "Email", bg: "bg-neutral-500", icon: MdEmail },
]

interface PortfolioShareButtonProps {
  url: string
  portfolioName?: string
  className?: string
}

export function PortfolioShareButton({ url, portfolioName, className }: PortfolioShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareTitle = portfolioName ? `${portfolioName} on DevFolio` : "DevFolio portfolio"
  const shareText = portfolioName
    ? `Check out ${portfolioName}'s portfolio on DevFolio`
    : "Check out this DevFolio portfolio"

  const shareLinks = useMemo(() => {
    if (!url) return null
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(shareText)

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
      email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodedText}%0A${encodedUrl}`,
    } as Record<Exclude<ShareTarget, "native">, string>
  }, [url, shareText, shareTitle])

  const handleCopy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy share url", error)
    }
  }

  const handleShare = async (target: ShareTarget) => {
    if (!url) return
    if (target === "native") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url,
          })
          return
        } catch (error) {
          devWarn("Native share cancelled", error)
        }
      }
      await handleCopy()
      return
    }

    const link = shareLinks?.[target]
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <>
      <Button
        type="button"
        aria-label="Share portfolio"
        onClick={() => setOpen(true)}
        disabled={!url}
        className={cn(
          "fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-white shadow-lg transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 sm:bottom-6 sm:right-6",
          className
        )}
      >
        <ArrowUpRight className="h-4 w-4" />
        <span className="text-sm font-semibold">Share</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[92vw] max-w-md rounded-3xl border-0 p-0 shadow-2xl">
          <DialogHeader className="px-6 pb-0 pt-6 text-left">
            <DialogTitle className="text-lg font-semibold">Share this portfolio</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">Send the link or share it directly to your favourite network.</p>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 px-6 pb-2 pt-4">
            {shareOptions.map((option) => {
              const Icon = option.icon
              const disabled = !url || (option.id !== "native" && !shareLinks?.[option.id as Exclude<ShareTarget, "native">])
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleShare(option.id)}
                  disabled={disabled}
                  className={cn(
                    "flex flex-col items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none",
                    disabled && "opacity-40"
                  )}
                >
                  <span className={cn("flex h-12 w-12 items-center justify-center rounded-full text-white", option.bg)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>

          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Portfolio Link</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex-1 truncate text-sm font-semibold text-neutral-900">{url || "Loading..."}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!url}
                  className="rounded-full bg-white text-neutral-900 hover:bg-neutral-100"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
