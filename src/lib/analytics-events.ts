// Event emitter for real-time analytics updates
interface AnalyticsEventListener {
  (data: AnalyticsEventData): void
}

interface AnalyticsEventData {
  portfolioId: number
  event: 'view' | 'project_click' | 'social_click' | 'session_start' | 'session_end'
  data: any
}

class AnalyticsEventEmitter {
  private listeners: Map<number, Set<AnalyticsEventListener>> = new Map()

  // Subscribe to events for a specific portfolio
  subscribe(portfolioId: number, callback: AnalyticsEventListener): () => void {
    if (!this.listeners.has(portfolioId)) {
      this.listeners.set(portfolioId, new Set())
    }
    
    this.listeners.get(portfolioId)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(portfolioId)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(portfolioId)
        }
      }
    }
  }

  // Emit event for a specific portfolio
  emit(portfolioId: number, event: AnalyticsEventData['event'], data: any) {
    const callbacks = this.listeners.get(portfolioId)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback({
            portfolioId,
            event,
            data
          })
        } catch (error) {
          console.error('Error in analytics event callback:', error)
        }
      })
    }
  }

  // Get all portfolio IDs with active listeners
  getActivePortfolios(): number[] {
    return Array.from(this.listeners.keys())
  }
}

// Singleton instance
export const analyticsEvents = new AnalyticsEventEmitter()

