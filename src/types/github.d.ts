export interface GitHubProfile {
  id: number
  login: string
  name?: string
  email?: string
  avatar_url: string
  bio?: string
  location?: string
  blog?: string
  twitter_username?: string
  company?: string
  public_repos: number
  followers: number
  following: number
}
