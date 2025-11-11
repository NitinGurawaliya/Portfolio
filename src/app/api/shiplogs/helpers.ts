import type {
  Shiplog,
  ShiplogReactionType,
  PortfolioRepository,
  Repository,
  User,
} from "@prisma/client"

export const SHIPLOG_REACTION_TYPES: ShiplogReactionType[] = ["SHIPPED", "FIXED", "SUPPORT"]

export type ShiplogReactionCountMap = Map<number, Record<ShiplogReactionType, number>>

export interface ShiplogAuthor {
  id: number | null
  name: string
  githubUsername: string | null
  avatarUrl: string | null
}

export interface ShiplogProject {
  id: number
  name: string
  repositoryId: number
}

export interface ShiplogViewModel {
  id: number
  content: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
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

type ShiplogWithRelations = Shiplog & {
  author: Pick<User, "id" | "name" | "githubUsername" | "avatarUrl"> | null
  project:
    | (PortfolioRepository & {
        repository: Pick<Repository, "name"> | null
      })
    | null
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1)
  const pageSize = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "10", 10) || 10, 1), 50)
  return { page, pageSize }
}

export function createEmptyReactionCounts(): Record<ShiplogReactionType, number> {
  return {
    SHIPPED: 0,
    FIXED: 0,
    SUPPORT: 0,
  }
}

export function buildReactionCountMap(
  rows: Array<{
    shiplogId: number
    type: ShiplogReactionType
    _count: { _all: number }
  }>
): ShiplogReactionCountMap {
  const map: ShiplogReactionCountMap = new Map()
  rows.forEach((row) => {
    const counts = map.get(row.shiplogId) ?? createEmptyReactionCounts()
    counts[row.type] = row._count._all
    map.set(row.shiplogId, counts)
  })
  return map
}

export function formatShiplog(
  shiplog: ShiplogWithRelations,
  reactionCounts: ShiplogReactionCountMap,
  viewerReactionMap: Map<number, ShiplogReactionType>,
  followedAuthorIds: Set<number>,
  currentUserId?: number
): ShiplogViewModel {
  const counts = reactionCounts.get(shiplog.id) ?? createEmptyReactionCounts()
  const authorId = shiplog.author?.id ?? null
  const authorName = shiplog.author?.name ?? shiplog.author?.githubUsername ?? "Unknown"
  const isSelf = authorId !== null && currentUserId === authorId
  const isFollowed = authorId !== null ? followedAuthorIds.has(authorId) : false

  return {
    id: shiplog.id,
    content: shiplog.content,
    imageUrl: shiplog.imageUrl,
    createdAt: shiplog.createdAt,
    updatedAt: shiplog.updatedAt,
    project: shiplog.project
      ? {
          id: shiplog.project.id,
          name: shiplog.project.customName ?? shiplog.project.repository?.name ?? "",
          repositoryId: shiplog.project.repositoryId,
        }
      : null,
    author: {
      id: authorId,
      name: authorName,
      githubUsername: shiplog.author?.githubUsername ?? null,
      avatarUrl: shiplog.author?.avatarUrl ?? null,
    },
    reactions: {
      shipped: counts.SHIPPED ?? 0,
      fixed: counts.FIXED ?? 0,
      support: counts.SUPPORT ?? 0,
    },
    viewerReaction: viewerReactionMap.get(shiplog.id) ?? null,
    isAuthorSelf: isSelf,
    isAuthorFollowed: isSelf ? true : isFollowed,
  }
}
