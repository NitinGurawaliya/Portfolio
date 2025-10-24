// Utility function to track project clicks
export const trackProjectClick = async (portfolioId: number, projectId: number, projectName: string) => {
  try {
    console.log(`🔍 DEBUG: Attempting to track project click:`, {
      portfolioId,
      projectId,
      projectName,
      url: '/api/analytics/track-project-click',
      portfolioIdType: typeof portfolioId,
      projectIdType: typeof projectId
    })
    
    const response = await fetch('/api/analytics/track-project-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolioId,
        projectId,
        projectName,
        ipAddress: null, // Will be handled by server
        userAgent: navigator.userAgent,
        referrer: document.referrer
      })
    })
    
    const result = await response.json()
    console.log(`🔍 DEBUG: Project click tracking response:`, result)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || 'Unknown error'}`)
    }
    
    console.log(`✅ DEBUG: Project click tracked successfully for ${projectName}`)
  } catch (error) {
    console.error('❌ DEBUG: Failed to track project click:', error)
  }
}
