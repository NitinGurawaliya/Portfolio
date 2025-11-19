"use client"

import { useState } from "react"
import { X, Copy, Check, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface SharePortfolioWidgetProps {
  portfolioUrl: string
  onClose?: () => void
}

export function SharePortfolioWidget({ portfolioUrl, onClose }: SharePortfolioWidgetProps) {
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const tweetText = `🚀 Just launched my portfolio on @devfolio_cc! Check it out: ${portfolioUrl}\n\nBuilt with #DevFolio - the easiest way to showcase your work!`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleShareOnX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const handleClose = () => {
    setIsVisible(false)
    // Store in localStorage that user dismissed the widget
    if (typeof window !== "undefined") {
      localStorage.setItem("devfolio:share-widget-dismissed", "true")
    }
    onClose?.()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-50 w-full max-w-xs"
      >
        <Card className="border border-border/50 bg-card shadow-xl backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
                    <Share2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Share Your Portfolio
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Your portfolio is live! Share it with the world.
                </p>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-2">
                    <span className="text-xs font-mono text-foreground truncate flex-1">
                      {portfolioUrl}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                      title="Copy URL"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  
                  <Button
                    onClick={handleShareOnX}
                    className="w-full bg-foreground text-background hover:bg-foreground/90"
                    size="sm"
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Share on X
                  </Button>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="shrink-0 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

