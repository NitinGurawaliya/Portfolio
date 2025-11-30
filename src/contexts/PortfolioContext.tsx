"use client"

import { createContext, useContext, ReactNode } from "react"
import type { Repository } from "@/interface"
import { usePortfolio } from "@/hooks/usePortfolio"

// Extract return type from usePortfolio hook
type UsePortfolioReturn = ReturnType<typeof usePortfolio>

interface PortfolioContextType {
  githubRepos: Repository[]
  allRepositories: Repository[]
  availableLanguages: string[]
  portfolio?: UsePortfolioReturn
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export function PortfolioProvider({ 
  children, 
  githubRepos, 
  allRepositories, 
  availableLanguages,
  portfolio
}: { 
  children: ReactNode
  githubRepos: Repository[]
  allRepositories: Repository[]
  availableLanguages: string[]
  portfolio?: UsePortfolioReturn
}) {
  return (
    <PortfolioContext.Provider value={{ githubRepos, allRepositories, availableLanguages, portfolio }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext)
  if (!context) {
    // Return default values if context is not available (shouldn't happen in normal flow)
    return {
      githubRepos: [],
      allRepositories: [],
      availableLanguages: []
    }
  }
  return context
}

