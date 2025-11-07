import { getWallOfFamePortfolios } from "@/lib/services/wall-of-fame"
import { WallOfFameClient } from "./wall-of-fame-client"

interface WallOfFameProps {
  limit?: number
}

export async function WallOfFame({ limit = 3 }: WallOfFameProps) {
  try {
    const portfolios = await getWallOfFamePortfolios(limit)
    return <WallOfFameClient portfolios={portfolios} />
  } catch (error) {
    console.error("WallOfFame: failed to load portfolios", error)
    return <WallOfFameClient portfolios={null} error="Failed to load portfolios" />
  }
}
