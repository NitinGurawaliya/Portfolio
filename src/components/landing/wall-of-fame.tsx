import { getWallOfFamePortfolios } from "@/lib/services/wall-of-fame"
import { WallOfFameClient } from "./wall-of-fame-client"

export async function WallOfFame() {
  try {
    const portfolios = await getWallOfFamePortfolios()
    return <WallOfFameClient portfolios={portfolios} />
  } catch (error) {
    console.error("WallOfFame: failed to load portfolios", error)
    return <WallOfFameClient portfolios={null} error="Failed to load portfolios" />
  }
}
