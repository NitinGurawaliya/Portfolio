import { PortfolioData } from "@/interface"

export type ProfileCompletionSectionId = "bio" | "projects" | "skills" | "socials" | "experience" | "cv"

export type ProfileCompletionSectionStatus = "complete" | "in-progress" | "pending"

export interface ProfileCompletionSection {
  id: ProfileCompletionSectionId
  label: string
  targetSection: string
  percent: number
  completed: number
  total: number
  message: string
  status: ProfileCompletionSectionStatus
}

export interface ProfileCompletionSummary {
  sections: ProfileCompletionSection[]
  overallPercent: number
}

export interface ProfileCompletionInput {
  portfolioData?: Partial<PortfolioData>
  selectedRepos?: number[]
  repoDetails?: {
    deployedUrls?: Record<number, string | undefined>
    customDescriptions?: Record<number, string | undefined>
    customNames?: Record<number, string | undefined>
    projectStatuses?: Record<number, string | undefined>
    projectCategories?: Record<number, string | undefined>
  }
  skills?: Array<{ name?: string | null }>
  socials?: Array<{ platform?: string | null; username?: string | null; url?: string | null }>
  experiences?: Array<{
    companyName?: string | null
    role?: string | null
    description?: string | null
    duration?: string | null
  }>
  cvUrl?: string | null
}

const SECTION_WEIGHTS: Record<ProfileCompletionSectionId, number> = {
  bio: 0.25,
  projects: 0.2,
  skills: 0.15,
  socials: 0.15,
  experience: 0.15,
  cv: 0.1,
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const fieldFilled = (value?: string | null, minChars = 1) => {
  if (typeof value !== "string") return false
  return value.trim().length >= minChars
}

const computeBioSection = (data?: Partial<PortfolioData>): ProfileCompletionSection => {
  const rules: Array<{ value?: string; min?: number }> = [
    { value: data?.displayName, min: 2 },
    { value: data?.jobTitle, min: 2 },
    { value: data?.bio, min: 40 },
    { value: data?.profilePic, min: 10 },
    { value: data?.customUsername, min: 3 },
  ]
  const total = rules.length
  const completed = rules.reduce((count, rule) => count + (fieldFilled(rule.value, rule.min) ? 1 : 0), 0)
  const percent = clampPercent((completed / total) * 100)
  const status: ProfileCompletionSectionStatus =
    percent === 100 ? "complete" : percent >= 50 ? "in-progress" : "pending"
  return {
    id: "bio",
    label: "Bio",
    targetSection: "home",
    percent,
    completed,
    total,
    message:
      percent === 100
        ? "Hero section is ready."
        : "Add your display name, title, bio, avatar, and username.",
    status,
  }
}

const computeProjectsSection = (
  selectedRepos?: number[],
  repoDetails?: ProfileCompletionInput["repoDetails"],
): ProfileCompletionSection => {
  const targetProjects = 3
  const picked = selectedRepos?.length ?? 0
  const detailCount =
    selectedRepos?.reduce((count, repoId) => {
      const hasDescription = fieldFilled(repoDetails?.customDescriptions?.[repoId], 32)
      const hasDeployment = fieldFilled(repoDetails?.deployedUrls?.[repoId], 10)
      const hasLabel = fieldFilled(repoDetails?.customNames?.[repoId], 3)
      const hasStatus = fieldFilled(repoDetails?.projectStatuses?.[repoId], 3)
      const hasCategory = fieldFilled(repoDetails?.projectCategories?.[repoId], 3)
      return count + (hasDescription || hasDeployment || hasLabel || hasStatus || hasCategory ? 1 : 0)
    }, 0) ?? 0

  const baseScore = Math.min(picked / targetProjects, 1)
  const detailScore = Math.min(detailCount / targetProjects, 1)
  const percent = clampPercent((baseScore * 0.6 + detailScore * 0.4) * 100)
  const status: ProfileCompletionSectionStatus =
    percent === 100 ? "complete" : percent >= 50 ? "in-progress" : "pending"

  return {
    id: "projects",
    label: "Projects",
    targetSection: "repos",
    percent,
    completed: Math.min(picked, targetProjects),
    total: targetProjects,
    message:
      percent === 100
        ? "Projects look great."
        : "Select at least 3 projects and add descriptions or live links.",
    status,
  }
}

const computeSkillsSection = (skills?: Array<{ name?: string | null }>): ProfileCompletionSection => {
  const filled = skills?.filter((skill) => fieldFilled(skill?.name, 2)).length ?? 0
  const target = 6
  const percent = clampPercent(Math.min(filled / target, 1) * 100)
  const status: ProfileCompletionSectionStatus =
    percent === 100 ? "complete" : percent >= 50 ? "in-progress" : "pending"
  return {
    id: "skills",
    label: "Skills",
    targetSection: "skills",
    percent,
    completed: Math.min(filled, target),
    total: target,
    message:
      percent === 100 ? "Skill matrix is rich." : "Add at least 6 well-defined skills.",
    status,
  }
}

const computeSocialsSection = (
  socials?: Array<{ platform?: string | null; username?: string | null; url?: string | null }>,
): ProfileCompletionSection => {
  const filled =
    socials?.filter((social) => fieldFilled(social?.username, 2) && fieldFilled(social?.url, 6)).length ?? 0
  const target = 3
  const percent = clampPercent(Math.min(filled / target, 1) * 100)
  const status: ProfileCompletionSectionStatus =
    percent === 100 ? "complete" : percent >= 50 ? "in-progress" : "pending"
  return {
    id: "socials",
    label: "Socials",
    targetSection: "socials",
    percent,
    completed: Math.min(filled, target),
    total: target,
    message:
      percent === 100 ? "Links are ready." : "Add at least 3 working social links.",
    status,
  }
}

const computeExperienceSection = (
  experiences?: Array<{ companyName?: string | null; role?: string | null; description?: string | null; duration?: string | null }>,
): ProfileCompletionSection => {
  const detailed =
    experiences?.filter(
      (exp) =>
        fieldFilled(exp?.companyName, 2) &&
        (fieldFilled(exp?.role, 2) || fieldFilled(exp?.description, 20) || fieldFilled(exp?.duration, 4)),
    ).length ?? 0
  const target = 2
  const percent = clampPercent(Math.min(detailed / target, 1) * 100)
  const status: ProfileCompletionSectionStatus =
    percent === 100 ? "complete" : percent >= 50 ? "in-progress" : "pending"
  return {
    id: "experience",
    label: "Experience",
    targetSection: "home",
    percent,
    completed: Math.min(detailed, target),
    total: target,
    message:
      percent === 100 ? "Experience section is solid." : "Add at least 2 rich experiences.",
    status,
  }
}

const computeCvSection = (cvUrl?: string | null): ProfileCompletionSection => {
  const hasCv = fieldFilled(cvUrl, 6)
  return {
    id: "cv",
    label: "Manual CV link",
    targetSection: "home",
    percent: hasCv ? 100 : 0,
    completed: hasCv ? 1 : 0,
    total: 1,
    message: hasCv ? "External CV link added." : "Optional: add a hosted CV link.",
    status: hasCv ? "complete" : "pending",
  }
}

export const computeProfileCompletion = (input: ProfileCompletionInput): ProfileCompletionSummary => {
  const sections: ProfileCompletionSection[] = [
    computeBioSection(input.portfolioData),
    computeProjectsSection(input.selectedRepos, input.repoDetails),
    computeSkillsSection(input.skills),
    computeSocialsSection(input.socials),
    computeExperienceSection(input.experiences),
    computeCvSection(input.cvUrl),
  ]

  const weightedScore = sections.reduce((score, section) => {
    const weight = SECTION_WEIGHTS[section.id]
    return score + (section.percent / 100) * weight
  }, 0)

  return {
    sections,
    overallPercent: clampPercent(weightedScore * 100),
  }
}
