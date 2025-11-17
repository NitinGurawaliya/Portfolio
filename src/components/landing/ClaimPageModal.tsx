"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Loader2 } from "lucide-react"

interface ClaimPageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClaimPageModal({ open, onOpenChange }: ClaimPageModalProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [availability, setAvailability] = useState<{
    available: boolean | null
    message: string
  }>({
    available: null,
    message: ""
  })

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailability({ available: null, message: "" })
      return
    }

    const timer = setTimeout(async () => {
      setIsChecking(true)
      try {
        const response = await fetch("/api/portfolio/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setAvailability({
            available: data.available,
            message: data.message || (data.available ? "Username available!" : "Username already taken")
          })
        } else {
          setAvailability({
            available: false,
            message: data.message || "Error checking username"
          })
        }
      } catch (error) {
        setAvailability({
          available: false,
          message: "Error checking availability"
        })
      } finally {
        setIsChecking(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  const handleClaim = () => {
    if (availability.available && username) {
      // Redirect to auth page with username parameter
      router.push(`/auth?username=${encodeURIComponent(username)}`)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only alphanumeric, hyphens, and underscores
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "")
    setUsername(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Your Page</DialogTitle>
          <DialogDescription>
            Choose your unique username. Your portfolio will be available at devfolio.com/{username || "your-username"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="your-username"
                value={username}
                onChange={handleUsernameChange}
                className="pr-10"
                autoFocus
              />
              {isChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isChecking && availability.available !== null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {availability.available ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            
            {availability.message && (
              <p className={`text-sm ${
                availability.available 
                  ? "text-green-600 dark:text-green-500" 
                  : "text-red-600 dark:text-red-500"
              }`}>
                {availability.message}
              </p>
            )}

            {username.length > 0 && username.length < 3 && (
              <p className="text-sm text-muted-foreground">
                Username must be at least 3 characters
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Preview:</strong> devfolio.com/
              <span className="text-primary font-medium">
                {username || "your-username"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClaim}
            disabled={!availability.available || isChecking}
            className="flex-1"
          >
            Continue to Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

