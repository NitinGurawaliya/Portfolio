import type { ThemeRepositoryDetails } from "@/components/themes/types"

export function getRepositoryLanguages(repository: ThemeRepositoryDetails): string[] {
  if (Array.isArray(repository.languages)) {
    return repository.languages.filter((language): language is string => typeof language === "string" && Boolean(language))
  }

  if (typeof repository.languages === "string") {
    try {
      const parsed = JSON.parse(repository.languages)
      if (Array.isArray(parsed)) {
        return parsed.filter((language): language is string => typeof language === "string" && Boolean(language))
      }
    } catch {
      // Use single language fallback below.
    }
  }

  if (repository.language) {
    return [repository.language]
  }

  return []
}
