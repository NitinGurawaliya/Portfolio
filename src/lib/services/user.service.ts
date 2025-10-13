import { prisma } from "@/lib/prisma"

export type GitHubUserData = {
  id: number | string
  login?: string
  name?: string | null
  email?: string | null
  avatar_url?: string | null
  bio?: string | null
  location?: string | null
  blog?: string | null
  twitter_username?: string | null
  company?: string | null
  public_repos?: number | null
  followers?: number | null
  following?: number | null
}

export async function upsertUserFromGitHub(userData: GitHubUserData, resolvedEmail: string) {
  const savedUser = await prisma.user.upsert({
    where: { githubId: String(userData.id) },
    update: {
      name: userData.name || userData.login || "",
      email: resolvedEmail,
      githubUsername: userData.login || "",
      avatarUrl: userData.avatar_url || undefined,
      bio: userData.bio || undefined,
      location: userData.location || undefined,
      websiteUrl: userData.blog || undefined,
      twitterUsername: userData.twitter_username || undefined,
      company: userData.company || undefined,
      publicRepos: userData.public_repos || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
    },
    create: {
      githubId: String(userData.id),
      name: userData.name || userData.login || "",
      email: resolvedEmail,
      githubUsername: userData.login || "",
      avatarUrl: userData.avatar_url || undefined,
      bio: userData.bio || undefined,
      location: userData.location || undefined,
      websiteUrl: userData.blog || undefined,
      twitterUsername: userData.twitter_username || undefined,
      company: userData.company || undefined,
      publicRepos: userData.public_repos || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
    },
  })
  return savedUser
}

export async function getUserByGithubId(githubId: string) {
  return prisma.user.findUnique({ where: { githubId } })
}
