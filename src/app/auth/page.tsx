"use client"

import { Github } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DevFolioLoader } from "@/components/ui/DevFolioLoader";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(253,105,33,0.08),_transparent_55%)]" />
      <Card className="relative z-10 w-full max-w-md border border-border/60 bg-card/80 shadow-2xl backdrop-blur">
        <CardContent className="space-y-8 p-8">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-2xl font-bold text-white shadow-lg">
              D
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">Welcome to DevFolio</h1>
              <p className="text-sm text-muted-foreground">
                Import your GitHub projects, customize your theme, and publish in minutes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="/api/auth/github"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </a>

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
