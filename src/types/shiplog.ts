export type ShiplogReactionType = "SHIPPED" | "FIXED" | "SUPPORT"

export interface ShiplogProject {
  id: number
  name: string
  repositoryId: number
}

export interface ShiplogAuthor {
  id: number | null
  name: string
  githubUsername: string | null
  avatarUrl: string | null
}

export interface Shiplog {
  id: number
  content: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  project: ShiplogProject | null
  author: ShiplogAuthor
  reactions: {
    shipped: number
    fixed: number
    support: number
  }
  viewerReaction: ShiplogReactionType | null
  isAuthorSelf: boolean
  isAuthorFollowed: boolean
}

export interface ShiplogProjectOption {
  id: number
  name: string
}
