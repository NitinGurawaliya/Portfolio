export interface HomeFormData {
  displayName: string
  jobTitle: string
  bio: string
  profilePic: string
  customUsername: string
}

export interface UsernameAvailability {
  isChecking: boolean
  isAvailable: boolean | null
  message: string
}

export interface ExperienceItem {
  id: number
  companyName?: string
  role?: string
  duration?: string
  description?: string
  faviconUrl?: string
  [key: string]: unknown
}
