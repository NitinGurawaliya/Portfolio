/**
 * Username Input Component with availability check
 */

"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { UsernameAvailability } from "@/types/portfolio.types"

interface UsernameInputProps {
  username: string
  availability: UsernameAvailability
  onChange: (value: string) => void
}

export function UsernameInput({ 
  username, 
  availability, 
  onChange 
}: UsernameInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="customUsername" className="text-black font-medium text-sm">
        Portfolio Username
      </Label>
      <div className="relative">
        <Input
          id="customUsername"
          value={username}
          onChange={(e) => onChange(e.target.value)}
          className="bg-gray-50 text-black font-medium text-sm focus:bg-white pr-10 placeholder:text-gray-400"
          placeholder="Your portfolio username"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {availability.isChecking && (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          )}
          {!availability.isChecking && availability.isAvailable === true && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {!availability.isChecking && availability.isAvailable === false && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
      {availability.message && (
        <p className={`text-[11px] font-medium ${
          availability.isAvailable === true ? 'text-green-600' : 
          availability.isAvailable === false ? 'text-red-600' : 
          'text-gray-500'
        }`}>
          {availability.message}
        </p>
      )}
      <p className="text-[11px] text-gray-500">
        This will be used in your portfolio URL: /portfolio/{username || 'username'}
      </p>
    </div>
  )
}

