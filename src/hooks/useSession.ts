import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User } from "@/interface"
import { fetchSession, fetchGitHubData } from "@/lib/services/portfolio-service"

export const useSession = () => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const initSession = async () => {
      try {
        // Fetch session
        const sessionData = await fetchSession()
        setSession(sessionData)
        
        // Fetch GitHub data
        const userData = await fetchGitHubData()
        setUser(userData)
        
        return userData
      } catch (error) {
        console.error("Session init error:", error)
        router.push("/auth")
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [router])

  return {
    user,
    session,
    loading,
    setUser,
  }
}

