interface PortfolioLoadingProps {
  fullScreen?: boolean
}

export function PortfolioLoading({ fullScreen = false }: PortfolioLoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-start p-4">
        <p className="text-sm font-medium text-gray-700">loading...</p>
      </div>
    )
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <p className="text-sm font-medium text-gray-700">loading...</p>
    </div>
  )
}
