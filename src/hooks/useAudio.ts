import { useEffect, useRef, useCallback } from 'react'
import { audioEngine, type SoundId } from '../core/audioEngine'
import type { SoundProfile } from '../core/gameState'

export function useAudio(profile: SoundProfile) {
  const initializedRef = useRef(false)

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (!initializedRef.current) {
      await audioEngine.init()
      initializedRef.current = true
    }
    await audioEngine.resume()
  }, [])

  // Update profile when it changes
  useEffect(() => {
    audioEngine.setProfile(profile)
  }, [profile])

  // Play a sound
  const play = useCallback((soundId: SoundId) => {
    audioEngine.play(soundId)
  }, [])

  // Schedule countdown
  const scheduleCountdown = useCallback((secondsRemaining: number) => {
    audioEngine.scheduleCountdown(secondsRemaining)
  }, [])

  // Cancel scheduled sounds
  const cancelScheduled = useCallback(() => {
    audioEngine.cancelScheduled()
  }, [])

  return {
    initAudio,
    play,
    scheduleCountdown,
    cancelScheduled,
  }
}
