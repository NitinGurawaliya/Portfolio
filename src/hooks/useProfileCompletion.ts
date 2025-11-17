"use client"

import { useMemo } from "react"
import {
  ProfileCompletionInput,
  ProfileCompletionSummary,
  computeProfileCompletion,
} from "@/lib/profile-completion"

export const useProfileCompletion = (input: ProfileCompletionInput): ProfileCompletionSummary => {
  return useMemo(() => computeProfileCompletion(input), [
    input.portfolioData,
    input.selectedRepos,
    input.repoDetails?.customDescriptions,
    input.repoDetails?.customNames,
    input.repoDetails?.deployedUrls,
    input.repoDetails?.projectCategories,
    input.repoDetails?.projectStatuses,
    input.skills,
    input.socials,
    input.experiences,
    input.cvUrl,
  ])
}
