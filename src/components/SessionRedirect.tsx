"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function SessionRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Secure session detection - only redirect if session is verified
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" })
        if (response.ok) {
          const data = await response.json()
          // Only redirect if session is verified and valid
          if (data.success && data.session) {
            // User is already logged in with valid session, redirect to dashboard
            router.push("/dashboard")
          }
        }
      } catch (error) {
        // Silently fail, user is not logged in or session invalid
        console.log("No active session or session validation failed")
      }
    }

    checkSession()
  }, [router])

  // This component doesn't render anything
  return null
}

