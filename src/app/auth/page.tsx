import { Github } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-8">
            Welcome to DevFolio
          </h1>
        </div>

        {/* Auth Button */}
        <div className="text-center">
          <a
            href="/api/auth/github"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center mb-6 block"
          >
            <div className="flex items-center justify-center">
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </div>
          </a>

          {/* Safety Message */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-300 font-medium">Your data is safe</p>
                <p className="text-xs text-gray-400 mt-1">
                  We only access your <span className="text-green-400">public repositories</span> and profile information. 
                  No private data is accessed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
