"use client"

import { useState } from "react"
import { Github } from "lucide-react"

export default function AuthPage() {
  const [loading, setLoading] = useState(false)

  const handleGitHubSignIn = async () => {
    setLoading(true)
    try {
      // Redirect to our custom GitHub OAuth endpoint
      window.location.href = "/api/auth/github"
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Portfolio
          </h1>
          <p className="text-gray-600 text-base">
            Build your professional presence
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-black rounded-xl p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
              <Github className="h-6 w-6 text-white" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              Connect with GitHub
            </h2>
            
            <p className="text-sm text-gray-400 mb-8">
              We'll fetch your profile and repositories to build your portfolio
            </p>
            
            <button
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin mr-2"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Github className="w-4 h-4 mr-2" />
                  Continue with GitHub
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By connecting, you agree to fetch your public GitHub data
          </p>
        </div>
      </div>
    </div>
  )
}
