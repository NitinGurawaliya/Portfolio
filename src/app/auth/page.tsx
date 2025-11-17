"use client"

import { Github } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DevFolioLoader } from "@/components/ui/DevFolioLoader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "error">("idle")
  const [usernameMessage, setUsernameMessage] = useState("Reserve a short link for your DevFolio (optional)")
  
  const normalizedUsername = useMemo(() => {
    return username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
  }, [username])

  useEffect(() => {
    const claimed = searchParams.get("username") || ""
    if (claimed) {
      setUsername(claimed.toLowerCase())
    }
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get("needsUsernameRetry")) {
      setUsernameStatus("error")
      setUsernameMessage("That username was already taken—choose another to continue")
    }
  }, [searchParams])

  const handleUsernameInput = useCallback((value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9-_]/g, "")
    setUsername(cleaned.toLowerCase())
  }, [])

  useEffect(() => {
    // REMOVED: Onboarding flow - all authenticated users go to dashboard
    // Session detection - if user is authenticated, redirect to dashboard
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (data.session) {
            // User is authenticated - redirect to dashboard
            router.push("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.log("No active session")
      } finally {
        setIsChecking(false)
      }
    }
    checkSession()
  }, [router])

  // Show loader while checking session
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <DevFolioLoader size="lg" />
      </div>
    )
  }

  useEffect(() => {
    if (!normalizedUsername) {
      setUsernameStatus("idle")
      setUsernameMessage("Reserve a short link for your DevFolio (optional)")
      return
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
      setUsernameStatus("error")
      setUsernameMessage("Username must be between 3 and 20 characters")
      return
    }

    setUsernameStatus("checking")
    setUsernameMessage("Checking availability...")

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
          throw new Error(data?.message || data?.error || "Failed to check username")
        }

        if (data.available) {
          setUsernameStatus("available")
          setUsernameMessage(`/${normalizedUsername} is available`)
        } else {
          setUsernameStatus("error")
          setUsernameMessage(data.message || "Username already taken")
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setUsernameStatus("error")
          setUsernameMessage("Network error, please retry")
        }
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [normalizedUsername])

  const handleGitHubLogin = useCallback(async () => {
    if (isSubmitting) return

    if (normalizedUsername) {
      if (usernameStatus === "checking") {
        setUsernameMessage("Please wait while we finish checking...")
        return
      }
      if (usernameStatus !== "available") {
        setUsernameStatus("error")
        setUsernameMessage("Pick an available username to continue")
        return
      }
    }

    setIsSubmitting(true)
    const target = normalizedUsername
      ? `/api/auth/github?username=${encodeURIComponent(normalizedUsername)}`
      : "/api/auth/github"
    window.location.href = target
  }, [isSubmitting, normalizedUsername, usernameStatus])

  return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(253,105,33,0.08),_transparent_55%)]" />
        <Card className="relative z-10 w-full max-w-md border border-border/60 bg-card/80 shadow-2xl backdrop-blur">
          <CardContent className="space-y-6 p-6 sm:space-y-8 sm:p-8">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-2xl font-bold text-white shadow-lg">
              D
            </div>
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Welcome to DevFolio</h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                Import your GitHub projects, customize your theme, and publish in minutes.
              </p>
            </div>
          </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Claim your DevFolio URL
              </Label>
              <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5">
                <span className="text-sm text-muted-foreground">devfolio.cc/</span>
                <Input
                  value={username}
                  onChange={(e) => handleUsernameInput(e.target.value)}
                  placeholder="your-handle"
                  className="border-0 bg-transparent px-0 focus-visible:ring-0"
                />
              </div>
              <p
                className={`text-xs ${
                  usernameStatus === "available"
                    ? "text-emerald-600"
                    : usernameStatus === "error"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {usernameMessage}
              </p>
            </div>

          <div className="space-y-4">
              <button
                onClick={handleGitHubLogin}
                disabled={
                  isSubmitting ||
                  usernameStatus === "checking" ||
                  (!!normalizedUsername && usernameStatus !== "available")
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
              >
                {isSubmitting ? (
                  <DevFolioLoader size="sm" />
                ) : (
                  <>
                    <Github className="h-5 w-5" />
                    Continue with GitHub
                  </>
                )}
              </button>

            <div className="rounded-xl border border-border/50 bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                  ✓
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-sm font-medium text-foreground">Your data stays yours</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We only request access to your public repositories and profile information. Private data is never touched.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <span className="font-medium text-foreground">Terms</span> and{" "}
            <span className="font-medium text-foreground">Privacy Policy</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
