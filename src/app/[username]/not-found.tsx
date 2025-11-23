import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-4">Portfolio Not Found</h1>
        <p className="text-gray-400 mb-6">
          This portfolio doesn't exist or hasn't been published yet.
        </p>
        <div className="space-y-3">
          <Button 
            asChild
            className="bg-white text-black hover:bg-gray-200 w-full"
          >
            <Link href="/">Go Home</Link>
          </Button>
          <Button 
            asChild
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full"
          >
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

