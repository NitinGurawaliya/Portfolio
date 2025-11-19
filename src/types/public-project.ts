export type PublicProjectPageData = {
  slug: string
  project: {
    id: number
    title: string
    description: string
    deployedUrl: string | null
    githubUrl: string | null
    favicon: string | null
    logo: string | null
    technologies: string | null
    languages: string[]
    createdAt: string
    updatedAt: string
      category: string | null
      status: string | null
      revenue: number | null
      mrr: number | null
      users: number | null
  }
  portfolio: {
    id: number
    name: string
    jobTitle: string | null
    bio: string
    profilePic: string | null
    slug: string
    githubUsername: string | null
    websiteUrl: string | null
    company: string | null
    location: string | null
    projectCount: number
    cvUrl: string | null
    skills: Array<{
      id: number
      name: string
      category: string | null
    }>
  }
  stats: {
    totalViews: number
    views7Days: number
    views30Days: number
    upvotes: number
    stars: number
    forks: number
  }
  viewerHasUpvoted: boolean
  shiplogs: Array<{
    id: number
    content: string
    imageUrl: string | null
    createdAt: string
    project: {
      id: number
      name: string
    } | null
  }>
}

