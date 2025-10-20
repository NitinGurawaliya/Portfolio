/**
 * Profile Picture Upload Component
 */

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { isValidImageType, isValidFileSize } from "@/lib/utils/validation.utils"

interface ProfilePictureUploadProps {
  profilePic: string
  displayName: string
  onPhotoChange: (base64String: string) => void
}

export function ProfilePictureUpload({ 
  profilePic, 
  displayName,
  onPhotoChange 
}: ProfilePictureUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (!isValidFileSize(file, 2)) {
      alert("File size must be less than 2MB")
      return
    }

    // Validate file type
    if (!isValidImageType(file)) {
      alert("Only JPG, PNG, and GIF files are allowed")
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      onPhotoChange(base64String)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="w-16 h-16">
        <AvatarImage src={profilePic} />
        <AvatarFallback className="bg-black text-white">
          {displayName?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png,image/gif"
          className="hidden"
          id="photo-upload"
        />
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-2 text-black hover:bg-black hover:text-white font-medium text-xs"
          onClick={() => document.getElementById('photo-upload')?.click()}
          type="button"
        >
          <Upload className="h-3 w-3 mr-1.5" />
          Change Photo
        </Button>
        <p className="text-xs text-gray-400">
          JPG, PNG or GIF. Max size 2MB.
        </p>
      </div>
    </div>
  )
}

