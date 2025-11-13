export interface ProjectSlugSource {
  id: number
  customName?: string | null
  repository?: {
    name?: string | null
  } | null
}

const removeDiacritics = (value: string) =>
  value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")

export const slugifyProjectName = (value: string) => {
  if (!value) return ""
  const cleaned = removeDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/-{2,}/g, "-")

  return cleaned
}

export const buildProjectSlug = (project: ProjectSlugSource) => {
  const base =
    slugifyProjectName(project.customName || project.repository?.name || "") ||
    `project-${project.id}`
  return base
}

export const createProjectSlugIndex = <T extends ProjectSlugSource>(
  projects: T[]
) => {
  const counts = new Map<string, number>()
  projects.forEach((project) => {
    const base = buildProjectSlug(project)
    counts.set(base, (counts.get(base) ?? 0) + 1)
  })

  const slugMap = new Map<string, T>()
  projects.forEach((project) => {
    const base = buildProjectSlug(project)
    const slug =
      (counts.get(base) ?? 0) > 1 ? `${base}-${project.id}` : base
    slugMap.set(slug, project)
  })

  return slugMap
}

export const getProjectSlugMap = <T extends ProjectSlugSource>(projects: T[]) => {
  const counts = new Map<string, number>()
  projects.forEach((project) => {
    const base = buildProjectSlug(project)
    counts.set(base, (counts.get(base) ?? 0) + 1)
  })

  return projects.reduce<Record<number, string>>((acc, project) => {
    const base = buildProjectSlug(project)
    acc[project.id] = (counts.get(base) ?? 0) > 1 ? `${base}-${project.id}` : base
    return acc
  }, {})
}

export const matchProjectBySlug = <T extends ProjectSlugSource>(
  projects: T[],
  slug: string
) => {
  const slugIndex = createProjectSlugIndex(projects)
  if (!slug) return undefined

  // direct match
  const direct = slugIndex.get(slug)
  if (direct) return direct

  const normalizedInput = slugifyProjectName(slug)
  if (normalizedInput) {
    const normalizedMatch = slugIndex.get(normalizedInput)
    if (normalizedMatch) return normalizedMatch
  }

  // handle slug-with-id pattern (e.g. slug-123)
  const matchWithId = slug.match(/^(.*?)-(\d+)$/)
  if (matchWithId) {
    const projectById = projects.find(
      (project) => String(project.id) === matchWithId[2]
    )
    if (projectById) return projectById
  }

  // final fallback: compare generated base slugs
  const fallback = projects.find((project) => {
    const base = buildProjectSlug(project)
    return base === slug || base === normalizedInput
  })

  return fallback
}
