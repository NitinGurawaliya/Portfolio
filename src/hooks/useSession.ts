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
        const sessionData = await fetchSession()
        setSession(sessionData)

        if (!sessionData) {
          setUser(null)
          setLoading(false)
          if (options.redirectOnAuthFailure) {
            router.push("/auth")
          }
          return null
        }

        const userData = await fetchGitHubData()
        setUser(userData ?? null)
        setLoading(false)
        return userData
      } catch (error) {
        console.error("Session init error:", error)
        setLoading(false)
        if (options.redirectOnAuthFailure) {
          router.push("/auth")
        }
      }
    }
    void initSession()
  }, [router, options.redirectOnAuthFailure])

  return {
    user,
    session,
    loading,
    setUser,
  }
}

