/**
 * Custom hook for managing skills
 */

import { useCallback } from "react"
import { Skill } from "@/types/portfolio.types"

interface UseSkillsOptions {
  skills: Skill[]
  onAddSkill?: (skill: Omit<Skill, 'id'>) => void
  onRemoveSkill?: (skillId: string) => void
}

export function useSkills(options: UseSkillsOptions) {
  const { skills, onAddSkill, onRemoveSkill } = options

  /**
   * Add a new skill
   */
  const addSkill = useCallback((skillData: Omit<Skill, 'id'>) => {
    // Check if skill already exists
    const exists = skills.some(
      skill => skill.name.toLowerCase() === skillData.name.toLowerCase()
    )

    if (!exists && onAddSkill) {
      onAddSkill(skillData)
      return true
    }

    return false
  }, [skills, onAddSkill])

  /**
   * Remove a skill
   */
  const removeSkill = useCallback((skillId: string) => {
    if (onRemoveSkill) {
      onRemoveSkill(skillId)
    }
  }, [onRemoveSkill])

  /**
   * Check if skill exists
   */
  const hasSkill = useCallback((skillName: string) => {
    return skills.some(skill => skill.name.toLowerCase() === skillName.toLowerCase())
  }, [skills])

  /**
   * Get skills by category
   */
  const getSkillsByCategory = useCallback((category: string) => {
    return skills.filter(skill => skill.category === category)
  }, [skills])

  /**
   * Get all categories
   */
  const getCategories = useCallback(() => {
    return Array.from(new Set(skills.map(skill => skill.category)))
  }, [skills])

  return {
    addSkill,
    removeSkill,
    hasSkill,
    getSkillsByCategory,
    getCategories,
  }
}

