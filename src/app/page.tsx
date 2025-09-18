"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check for session cookie
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('github-session='))
    
    if (sessionCookie) {
      router.push("/dashboard")
    } else {
      router.push("/auth")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white">Loading...</p>
      </div>
    </div>
  )
}
