import { z } from "zod"

export const portfolioPublishSchema = z.object({
  portfolioData: z.object({
    displayName: z.string().optional(),
    jobTitle: z.string().optional(),
    bio: z.string().optional(),
    profilePic: z.string().optional(),
    customUsername: z.string().optional(),
  }),
  selectedRepos: z.array(z.number()).optional().default([]),
  skills: z.array(z.object({ name: z.string(), category: z.string() })).optional().default([]),
  deployedUrls: z.record(z.string()).optional().default({}),
  userId: z.string(),
  userData: z
    .object({
      name: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      githubUsername: z.string().optional(),
      avatarUrl: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      websiteUrl: z.string().nullable().optional(),
      twitterUsername: z.string().nullable().optional(),
      company: z.string().nullable().optional(),
      publicRepos: z.number().optional(),
      followers: z.number().optional(),
      following: z.number().optional(),
    })
    .optional(),
})

export const portfolioHomeSchema = z.object({
  portfolioData: portfolioPublishSchema.shape.portfolioData,
  userId: z.string(),
  userData: portfolioPublishSchema.shape.userData.optional(),
})

export const portfolioReposSchema = z.object({
  repositories: z.array(z.any()).optional(),
  selectedRepos: z.array(z.number()).optional().default([]),
  deployedUrls: z.record(z.string()).optional().default({}),
  userId: z.string(),
  userData: portfolioPublishSchema.shape.userData.optional(),
})

export const portfolioSkillsSchema = z.object({
  skills: z.array(z.object({ name: z.string(), category: z.string() })).optional().default([]),
  userId: z.string(),
  userData: portfolioPublishSchema.shape.userData.optional(),
})

export const portfolioSocialsSchema = z.object({
  socials: z.array(z.object({ platform: z.string(), username: z.string(), url: z.string().optional(), isPinned: z.boolean().optional() })),
  userId: z.string(),
  userData: portfolioPublishSchema.shape.userData.optional(),
})

export const usernameCheckSchema = z.object({
  username: z.string(),
  currentUserId: z.string().optional(),
})

export const themeUpdateSchema = z.object({
  theme: z.string(),
  userId: z.string(),
})

export const portfolioPublishAllSchema = portfolioPublishSchema.extend({
  socials: z
    .array(
      z.object({
        platform: z.string(),
        username: z.string(),
        url: z.string().optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .optional(),
  customNames: z.record(z.string()).optional(),
  customDescriptions: z.record(z.string()).optional(),
  githubUrls: z.record(z.string()).optional(),
  selectedTheme: z.string().optional(),
  repositories: z.array(z.any()).optional(),
})
