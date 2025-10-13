"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function SessionRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Fast session detection - only redirect, don't block UI
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" })
        if (response.ok) {
          const data = await response.json()
          if (data.session) {
            // User is already logged in, redirect to dashboard
            router.push("/dashboard")
          }
        }
      } catch (error) {
        // Silently fail, user is not logged in
        console.log("No active session")
      }
    }

    checkSession()
  }, [router])

  // This component doesn't render anything
  return null
}

