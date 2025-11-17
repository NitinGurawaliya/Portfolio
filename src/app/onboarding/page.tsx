"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" })
        if (!response.ok) {
          // Not authenticated - redirect to auth
          router.push("/auth")
          return
        }
        
        const data = await response.json()
        if (!data.session) {
          router.push("/auth")
          return
        }
        
        setSession(data.session)
      } catch (error) {
        console.error("Error checking session:", error)
        router.push("/auth")
      } finally {
        setIsChecking(false)
      }
    }
    
    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <DevFolioLoader size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const username = searchParams.get("username")

  return <OnboardingFlow initialUsername={username} session={session} />
}

