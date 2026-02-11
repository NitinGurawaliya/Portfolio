import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChangeEvent } from "react"
import type { HomeFormData, UsernameAvailability } from "./types"

interface ProfileBasicsCardProps {
  formData: HomeFormData
  bioLimit: number
  bioCharacterCount: number
  usernameAvailability?: UsernameAvailability
  onDisplayNameChange: (value: string) => void
  onJobTitleChange: (value: string) => void
  onBioChange: (value: string) => void
  onUsernameChange: (value: string) => void
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function ProfileBasicsCard({
  formData,
  bioLimit,
  bioCharacterCount,
  usernameAvailability,
  onDisplayNameChange,
  onJobTitleChange,
  onBioChange,
  onUsernameChange,
  onPhotoChange,
}: ProfileBasicsCardProps) {
  return (
    <Card className="rounded-2xl bg-transparent shadow-none border-none">
      <CardContent className="space-y-3.5 sm:space-y-4.5 p-4 sm:p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
            <AvatarImage src={formData.profilePic} alt={formData.displayName || "Profile"} />
            <AvatarFallback className="text-lg">{(formData.displayName || "U").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("profilePicInput")?.click()}
                className="rounded-lg px-3"
              >
                Change photo
              </Button>
              <span className="text-xs text-muted-foreground">PNG, JPG or GIF (max 2MB)</span>
            </div>
            <input
              id="profilePicInput"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={onPhotoChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="displayName" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Display name
            </Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              className="h-9 rounded-lg border-border/60 bg-muted/30 text-[13px] focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="jobTitle" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Job title
            </Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => onJobTitleChange(e.target.value)}
              className="h-9 rounded-lg border-border/60 bg-muted/30 text-[13px] focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. • Full Stack Developer"
              maxLength={50}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="customUsername" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Portfolio username
            </Label>
            <div className="relative">
              <Input
                id="customUsername"
                value={formData.customUsername}
                onChange={(e) => onUsernameChange(e.target.value)}
                className="h-9 rounded-lg border-border/60 bg-muted/30 pl-7 text-[13px] focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Choose a unique username"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                /
              </span>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameAvailability?.isChecking && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
                {!usernameAvailability?.isChecking && usernameAvailability?.isAvailable === true && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                )}
                {!usernameAvailability?.isChecking && usernameAvailability?.isAvailable === false && (
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
            </div>
            {usernameAvailability?.message && (
              <p
                className={cn(
                  "text-xs font-medium leading-tight",
                  usernameAvailability.isAvailable === true
                    ? "text-emerald-600"
                    : usernameAvailability.isAvailable === false
                      ? "text-red-600"
                      : "text-muted-foreground"
                )}
              >
                {usernameAvailability.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="bio" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Bio <span className="ml-1 text-[11px] normal-case text-muted-foreground">(max {bioLimit} characters)</span>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => onBioChange(e.target.value)}
              className="rounded-lg border-border/60 bg-muted/30 text-[13px] focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Share your story, mission, or current focus…"
              rows={3}
              maxLength={bioLimit}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>This text appears in your live portfolio hero section.</span>
              <span>
                {bioCharacterCount}/{bioLimit}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
