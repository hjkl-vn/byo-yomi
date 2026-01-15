import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to manage screen wake lock.
 * Keeps the screen on while active (useful during game play).
 */
export function useWakeLock(active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      return // Wake Lock API not supported
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      // Wake lock request failed (e.g., page not visible)
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
      } catch {
        // Already released
      }
      wakeLockRef.current = null
    }
  }, [])

  // Request or release wake lock based on active state
  useEffect(() => {
    if (active) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [active, requestWakeLock, releaseWakeLock])

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active) {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [active, requestWakeLock])
}
