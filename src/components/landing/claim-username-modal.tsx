"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react"

interface ClaimUsernameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (username: string) => void
}

type AvailabilityState =
  | { status: "idle"; message: string }
  | { status: "checking"; message: string }
  | { status: "available"; message: string }
  | { status: "taken"; message: string }
  | { status: "error"; message: string }

const normalizeUsername = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")

export function ClaimUsernameModal({ open, onOpenChange, onSuccess }: ClaimUsernameModalProps) {
  const router = useRouter()
  const [rawUsername, setRawUsername] = useState("")
  const [availability, setAvailability] = useState<AvailabilityState>({
    status: "idle",
    message: "3-20 characters, letters / numbers / - / _ only",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedUsername = useMemo(() => normalizeUsername(rawUsername), [rawUsername])

  useEffect(() => {
    if (!open) {
      setRawUsername("")
      setAvailability({
        status: "idle",
        message: "3-20 characters, letters / numbers / - / _ only",
      })
    }
  }, [open])

  useEffect(() => {
    if (!normalizedUsername) {
      setAvailability({
        status: "idle",
        message: "3-20 characters, letters / numbers / - / _ only",
      })
      return
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
      setAvailability({
        status: "error",
        message: "Username must be 3-20 characters long",
      })
      return
    }

      setAvailability({
        status: "checking",
        message: "Checking availability...",
      })

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/portfolio/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: normalizedUsername }),
          signal: controller.signal,
        })
        const data = await res.json()

          if (!res.ok) {
            throw new Error(data?.message || data?.error || "Something went wrong")
          }

        if (data.available) {
          setAvailability({
            status: "available",
            message: `/${normalizedUsername} is available 🎉`,
          })
        } else {
          setAvailability({
            status: "taken",
            message: data.message || "Username already taken",
          })
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAvailability({
            status: "error",
            message: "Network error, please retry",
          })
        }
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [normalizedUsername])

  const handleSubmit = useCallback(() => {
    if (availability.status !== "available" || !normalizedUsername) return

    setIsSubmitting(true)
    const targetUrl = `/auth?username=${encodeURIComponent(normalizedUsername)}`
    if (onSuccess) {
      onSuccess(normalizedUsername)
    } else {
      router.push(targetUrl)
    }
    setTimeout(() => setIsSubmitting(false), 300)
  }, [availability.status, normalizedUsername, onSuccess, router])

  const helperIcon = useMemo(() => {
    switch (availability.status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "taken":
      case "error":
        return <XCircle className="h-4 w-4 text-rose-500" />
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      default:
        return <ShieldCheck className="h-4 w-4 text-muted-foreground" />
    }
  }, [availability.status])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-border/60">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Reserve your DevFolio URL</DialogTitle>
          <DialogDescription>
            People will find you at devfolio.cc{normalizedUsername ? `/${normalizedUsername}` : "/your-name"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Portfolio handle</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">devfolio.cc/</span>
              <Input
                value={rawUsername}
                onChange={(e) => setRawUsername(e.target.value)}
                placeholder="nitin"
                className="border-0 bg-transparent px-0 text-base font-semibold focus-visible:ring-0"
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              {helperIcon}
              <span>{availability.message}</span>
            </p>
          </div>

          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            This username auto-fills inside your dashboard bio
          </Badge>

        <Button
          className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-base font-semibold"
          disabled={availability.status !== "available" || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Taking you to login...
            </>
          ) : (
            "Continue"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-foreground underline-offset-2 hover:underline"
            onClick={() => {
              onOpenChange(false)
              router.push("/auth")
            }}
          >
            Log in
          </button>
        </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
