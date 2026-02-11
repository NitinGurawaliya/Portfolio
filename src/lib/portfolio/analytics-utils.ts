interface TrackPortfolioViewParams {
  portfolioId: number
  clientReferrer: string
}

export async function trackPortfolioView({ portfolioId, clientReferrer }: TrackPortfolioViewParams): Promise<void> {
  await fetch("/api/analytics/track-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      portfolioId,
      userId: null,
      clientReferrer,
    }),
  })
}
