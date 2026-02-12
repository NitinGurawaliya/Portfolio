export const RESERVED_PORTFOLIO_ROUTES = ["dashboard", "auth", "api", "_next", "favicon.ico"] as const

export function isReservedPortfolioRoute(username: string): boolean {
  return RESERVED_PORTFOLIO_ROUTES.includes(username as (typeof RESERVED_PORTFOLIO_ROUTES)[number])
}
