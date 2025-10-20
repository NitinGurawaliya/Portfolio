/**
 * Custom hook for managing social media accounts
 */

import { useCallback } from "react"
import { Social } from "@/types/portfolio.types"
import { getPlatformConfig } from "@/constants/social-platforms"

interface UseSocialsOptions {
  socials: Social[]
  onAddSocial?: (social: Omit<Social, 'id'>) => void
  onRemoveSocial?: (socialId: number) => void
  onTogglePin?: (socialId: number) => void
  onUpdateSocial?: (socialId: number, updates: Partial<Social>) => void
}

export function useSocials(options: UseSocialsOptions) {
  const { socials, onAddSocial, onRemoveSocial, onTogglePin, onUpdateSocial } = options

  /**
   * Add a new social account
   */
  const addSocial = useCallback((platform: string, username: string, isPinned: boolean = false) => {
    const platformConfig = getPlatformConfig(platform)
    if (!platformConfig || !onAddSocial) return

    const socialData = {
      platform,
      username: username.trim(),
      url: platformConfig.urlPattern.replace('{username}', username.trim()),
      isPinned
    }

    onAddSocial(socialData)
  }, [onAddSocial])

  /**
   * Remove a social account
   */
  const removeSocial = useCallback((socialId: number) => {
    if (onRemoveSocial) {
      onRemoveSocial(socialId)
    }
  }, [onRemoveSocial])

  /**
   * Toggle pin status
   */
  const togglePin = useCallback((socialId: number) => {
    if (onTogglePin) {
      onTogglePin(socialId)
    }
  }, [onTogglePin])

  /**
   * Update social account
   */
  const updateSocial = useCallback((socialId: number, updates: Partial<Social>) => {
    if (onUpdateSocial) {
      onUpdateSocial(socialId, updates)
    }
  }, [onUpdateSocial])

  /**
   * Update social username
   */
  const updateSocialUsername = useCallback((platform: string, username: string, isPinned: boolean = false) => {
    const existingSocial = socials.find(s => s.platform === platform)
    const platformConfig = getPlatformConfig(platform)

    if (!platformConfig) return

    if (username.trim() && existingSocial) {
      // Update existing social
      const socialData = {
        username: username.trim(),
        url: platformConfig.urlPattern.replace('{username}', username.trim()),
        isPinned
      }
      updateSocial(existingSocial.id, socialData)
    } else if (username.trim()) {
      // Add new social
      addSocial(platform, username, isPinned)
    } else if (!username.trim() && existingSocial) {
      // Remove social if username is cleared
      removeSocial(existingSocial.id)
    }
  }, [socials, addSocial, updateSocial, removeSocial])

  /**
   * Get social by platform
   */
  const getSocialByPlatform = useCallback((platform: string) => {
    return socials.find(s => s.platform === platform)
  }, [socials])

  /**
   * Get pinned socials
   */
  const getPinnedSocials = useCallback(() => {
    return socials.filter(s => s.isPinned)
  }, [socials])

  return {
    addSocial,
    removeSocial,
    togglePin,
    updateSocial,
    updateSocialUsername,
    getSocialByPlatform,
    getPinnedSocials,
  }
}

