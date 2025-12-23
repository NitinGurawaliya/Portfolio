import { prisma } from "@/lib/prisma"

export type ProjectIdResolution =
  | { kind: "ok"; portfolioRepositoryId: number }
  | { kind: "imported"; message: string }
  | { kind: "not_found" }
  | { kind: "invalid"; message: string }

const MAX_INT4 = 2147483647 // PostgreSQL INT4 max

function parseIntStrict(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n)) return null
  return n
}

/**
 * Resolves an incoming projectId to a stable PortfolioRepository.id.
 *
 * Accepts both:
 * - PortfolioRepository.id (preferred)
 * - Repository.githubId (legacy fallback)
 */
export async function resolvePortfolioRepositoryId(params: {
  portfolioId: number
  projectId: string | number
}): Promise<ProjectIdResolution> {
  const portfolioIdNum = parseIntStrict(params.portfolioId)
  if (!portfolioIdNum) {
    return { kind: "invalid", message: "Invalid portfolioId" }
  }

  const projectIdNum = parseIntStrict(params.projectId)
  if (!projectIdNum) {
    return { kind: "invalid", message: "Invalid projectId" }
  }

  // Imported projects sometimes use Date.now() IDs and are not persisted yet.
  if (projectIdNum > MAX_INT4) {
    return {
      kind: "imported",
      message: "Imported project - analytics will be available after saving to portfolio",
    }
  }

  const direct = await prisma.portfolioRepository.findFirst({
    where: {
      id: projectIdNum,
      portfolioId: portfolioIdNum,
      deletedAt: null,
    },
    select: { id: true },
  })

  if (direct) {
    return { kind: "ok", portfolioRepositoryId: direct.id }
  }

  // Legacy fallback: treat incoming id as repository.githubId
  try {
    const byGithubId = await prisma.portfolioRepository.findFirst({
      where: {
        portfolioId: portfolioIdNum,
        repository: { githubId: BigInt(projectIdNum) },
        deletedAt: null,
      },
      select: { id: true },
    })

    if (byGithubId) {
      return { kind: "ok", portfolioRepositoryId: byGithubId.id }
    }
  } catch {
    // BigInt conversion / Prisma errors -> treat as invalid
    return { kind: "invalid", message: "Invalid projectId" }
  }

  return { kind: "not_found" }
}

