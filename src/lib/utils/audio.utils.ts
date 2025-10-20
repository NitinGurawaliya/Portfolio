/**
 * Audio utilities for sound notifications
 */

/**
 * Plays a success notification sound (C-E-G chord)
 */
export function playSuccessSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.05)
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.05)
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + index * 0.05 + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.05 + 0.8)
      
      oscillator.start(audioContext.currentTime + index * 0.05)
      oscillator.stop(audioContext.currentTime + index * 0.05 + 0.8)
    })
  } catch (error) {
    console.log('Could not play notification sound:', error)
  }
}

/**
 * Plays an error notification sound
 */
export function playErrorSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.log('Could not play error sound:', error)
  }
}

