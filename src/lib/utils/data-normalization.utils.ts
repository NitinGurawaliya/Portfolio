/**
 * Data normalization utilities for consistent data structure
 */

import { Repository, Skill, Social } from "../../types/portfolio.types"

/**
 * Normalizes data by removing null/undefined values and empty objects/arrays
 */
export function normalizeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    // Remove null/undefined
    if (value === null || value === undefined) return undefined
    
    // Don't remove empty strings for specific properties
    const keepEmptyStringProps = ['displayName', 'jobTitle', 'bio', 'profilePic', 'customUsername']
    if (value === "" && !keepEmptyStringProps.includes(key)) return undefined
    
    // Remove empty objects/arrays
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value) && value.length === 0) return undefined
      if (!Array.isArray(value) && Object.keys(value).length === 0) return undefined
    }
    
    return value
  }))
}

/**
 * Normalizes imported projects to ensure languages field is consistent
 */
export function normalizeImportedProjects(projects: Repository[]): Repository[] {
  return projects.map(project => ({
    ...project,
    languages: project.languages || []
  }))
}

/**
 * Normalizes repository data
 */
export function normalizeRepository(repo: any): Repository {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name || repo.fullName,
    description: repo.description || "",
    htmlUrl: repo.html_url || repo.htmlUrl,
    homepage: repo.homepage || "",
    language: repo.language || "",
    languages: repo.languages || [],
    stargazersCount: repo.stargazers_count || repo.stargazersCount || 0,
    forksCount: repo.forks_count || repo.forksCount || 0,
    isPrivate: repo.private || repo.isPrivate || false,
    isFork: repo.fork || repo.isFork || false,
    size: repo.size || 0,
    createdAt: repo.created_at || repo.createdAt,
    updatedAt: repo.updated_at || repo.updatedAt,
    pushedAt: repo.pushed_at || repo.pushedAt,
    isImported: repo.isImported || false
  }
}

/**
 * Sorts array for consistent comparison
 */
export function sortForComparison<T>(array: T[], sortFn?: (a: T, b: T) => number): T[] {
  return [...array].sort(sortFn)
}

/**
 * Compares two data objects for changes
 */
export function hasDataChanged(current: any, original: any): boolean {
  const cleanCurrent = normalizeData(current)
  const cleanOriginal = normalizeData(original)
  return JSON.stringify(cleanCurrent) !== JSON.stringify(cleanOriginal)
}

