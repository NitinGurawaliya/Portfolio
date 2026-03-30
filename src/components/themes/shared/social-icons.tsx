import { Globe } from "lucide-react"
import { SiFacebook, SiGithub, SiGmail, SiInstagram, SiLinkedin, SiReddit, SiStackoverflow, SiX, SiYoutube } from "react-icons/si"
import type { SocialIconComponent } from "@/components/themes/shared/types"

const SOCIAL_ICONS: Record<string, SocialIconComponent> = {
  github: SiGithub,
  email: SiGmail,
  twitter: SiX,
  x: SiX,
  linkedin: SiLinkedin,
  instagram: SiInstagram,
  facebook: SiFacebook,
  youtube: SiYoutube,
  stackoverflow: SiStackoverflow,
  reddit: SiReddit,
}

export function getSocialIcon(platform: string): SocialIconComponent {
  return SOCIAL_ICONS[platform.toLowerCase()] || Globe
}
