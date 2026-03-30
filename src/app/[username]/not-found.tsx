import { PortfolioError } from "./components/PortfolioError"

export default function NotFound() {
  return <PortfolioError title="Portfolio Not Found" description="This portfolio does not exist or has not been published yet." />
}

