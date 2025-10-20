/**
 * Social media platform configurations
 */

import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Globe,
  Phone,
  LucideIcon
} from "lucide-react"
import { SiStackoverflow, SiReddit } from "react-icons/si"

export interface PlatformConfig {
  id: string
  name: string
  icon: LucideIcon | any
  color: string
  bgGradient: string
  placeholder: string
  urlPattern: string
  description: string
  textColor: string
}

export const SOCIAL_PLATFORMS: PlatformConfig[] = [
  {
    id: "github",
    name: "GitHub",
    icon: Github,
    color: "#24292e",
    bgGradient: "linear-gradient(135deg, #24292e, #1a1e22)",
    placeholder: "username",
    urlPattern: "https://github.com/{username}",
    description: "Your GitHub profile",
    textColor: "#ffffff"
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "#6B7280",
    bgGradient: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    placeholder: "email",
    urlPattern: "mailto:{username}",
    description: "Your email address",
    textColor: "#374151"
  },
  {
    id: "phone",
    name: "Phone",
    icon: Phone,
    color: "#10B981",
    bgGradient: "linear-gradient(135deg, #10B981, #059669)",
    placeholder: "+1234567890",
    urlPattern: "tel:{username}",
    description: "Your phone number",
    textColor: "#ffffff"
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "#1d9bf0",
    bgGradient: "linear-gradient(135deg, #1d9bf0, #0c7abf)",
    placeholder: "username",
    urlPattern: "https://twitter.com/{username}",
    description: "Your Twitter handle",
    textColor: "#ffffff"
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    bgGradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
    placeholder: "username",
    urlPattern: "https://instagram.com/{username}",
    description: "Your Instagram handle",
    textColor: "#ffffff"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0077b5",
    bgGradient: "linear-gradient(135deg, #0077b5, #005885)",
    placeholder: "username",
    urlPattern: "https://linkedin.com/in/{username}",
    description: "Your LinkedIn profile",
    textColor: "#ffffff"
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "#1877f2",
    bgGradient: "linear-gradient(135deg, #1877f2, #0d5cbf)",
    placeholder: "username",
    urlPattern: "https://facebook.com/{username}",
    description: "Your Facebook profile",
    textColor: "#ffffff"
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "#ff0000",
    bgGradient: "linear-gradient(135deg, #ff0000, #cc0000)",
    placeholder: "channelname",
    urlPattern: "https://youtube.com/@{username}",
    description: "Your YouTube channel",
    textColor: "#ffffff"
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    icon: SiStackoverflow,
    color: "#f58025",
    bgGradient: "linear-gradient(135deg, #f58025, #d16613)",
    placeholder: "userid",
    urlPattern: "https://stackoverflow.com/users/{username}",
    description: "Your Stack Overflow profile",
    textColor: "#ffffff"
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: SiReddit,
    color: "#ff4500",
    bgGradient: "linear-gradient(135deg, #ff4500, #cc3700)",
    placeholder: "username",
    urlPattern: "https://reddit.com/u/{username}",
    description: "Your Reddit profile",
    textColor: "#ffffff"
  },
  {
    id: "other",
    name: "Other Link",
    icon: Globe,
    color: "#8B5CF6",
    bgGradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    placeholder: "https://yourwebsite.com",
    urlPattern: "{username}",
    description: "Any other custom link",
    textColor: "#ffffff"
  },
]

/**
 * Get platform configuration by ID
 */
export function getPlatformConfig(platformId: string): PlatformConfig | undefined {
  return SOCIAL_PLATFORMS.find(p => p.id === platformId)
}

