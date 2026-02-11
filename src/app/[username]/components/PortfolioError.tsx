import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PortfolioErrorProps {
  title: string
  description: string
  showActions?: boolean
}

export function PortfolioError({ title, description, showActions = true }: PortfolioErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="mx-auto max-w-md px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">{title}</h1>
        <p className="mb-6 text-gray-400">{description}</p>

        {showActions && (
          <div className="space-y-3">
            <Button asChild className="w-full bg-white text-black hover:bg-gray-200">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
