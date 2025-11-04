import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User } from "@/interface"
import { fetchSession, fetchGitHubData } from "@/lib/services/portfolio-service"

export const useSession = (options: { redirectOnAuthFailure?: boolean } = {}) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const initSession = async () => {
      try {
        // Fetch session and GitHub data in parallel for faster loading
        const [sessionData, userData] = await Promise.all([
          fetchSession(),
          fetchGitHubData()
        ])
        
        setSession(sessionData)
        setUser(userData)
        
        // Set loading to false as soon as we have user data
        setLoading(false)
        return userData
      } catch (error) {
        console.error("Session init error:", error)
        setLoading(false)
        // सिर्फ़ प्रोटेक्टेड रूट्स पर redirect करें:
        if (options.redirectOnAuthFailure) {
          router.push("/auth")
        }
      }
    }
    initSession()
  }, [router, options.redirectOnAuthFailure])

  return {
    user,
    session,
    loading,
    setUser,
  }
}

