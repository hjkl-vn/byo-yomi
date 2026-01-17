import { useState, useRef, useCallback, useEffect } from 'react'
import type { GameConfig, GameState, Player } from '../core/gameState'
import { createInitialGameState } from '../core/gameState'
import { tick, onMove, getDisplayTime } from '../core/timeControl'
import { useAudio } from './useAudio'

export type GameClockCallbacks = {
  onEnteredOvertime?: (player: Player) => void
  onLowTime?: (player: Player, seconds: number) => void
  onGameOver?: (winner: Player) => void
}

export function useGameClock(config: GameConfig, callbacks?: GameClockCallbacks) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(config))

  const lastTickRef = useRef<number>(0)
  const animationFrameRef = useRef<number>(0)
  const lowTimeAlertedRef = useRef<Set<number>>(new Set())
  const enteredOvertimeRef = useRef<Set<Player>>(new Set())
  const prevDisplayMsRef = useRef<number>(0)

  const { initAudio, play, cancelScheduled } = useAudio(config.soundProfile)

  // Store latest values in refs to avoid stale closures in animation loop
  const gameStateRef = useRef(gameState)
  const configRef = useRef(config)
  const callbacksRef = useRef(callbacks)

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  // Start/stop game loop based on status
  useEffect(() => {
    if (gameState.status !== 'running') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = 0
      }
      return
    }

    lastTickRef.current = 0

    const gameLoop = (timestamp: number) => {
      if (gameStateRef.current.status !== 'running') {
        animationFrameRef.current = 0
        return
      }

      if (lastTickRef.current === 0) {
        lastTickRef.current = timestamp
      }

      const deltaMs = timestamp - lastTickRef.current
      lastTickRef.current = timestamp

      if (deltaMs > 0) {
        setGameState((prevState) => {
          if (prevState.status !== 'running') return prevState

          const activePlayer = prevState.activePlayer
          const playerState = prevState[activePlayer]

          const result = tick(playerState, configRef.current.timeControl, deltaMs)

          // Handle entering overtime
          if (result.enteredOvertime && !enteredOvertimeRef.current.has(activePlayer)) {
            enteredOvertimeRef.current.add(activePlayer)
            play('alert')
            callbacksRef.current?.onEnteredOvertime?.(activePlayer)
          }

          // Handle game over
          if (result.expired) {
            const winner = activePlayer === 'black' ? 'white' : 'black'
            play('gong')
            callbacksRef.current?.onGameOver?.(winner)
            return {
              ...prevState,
              [activePlayer]: result.newState,
              status: 'ended' as const,
              winner,
            }
          }

          // Check for low time alerts
          const displayMs = getDisplayTime(result.newState)
          const displaySeconds = Math.ceil(displayMs / 1000)

          // Clear alerts if time increased (entered overtime or period reset)
          if (displayMs > prevDisplayMsRef.current + 1000 && prevDisplayMsRef.current > 0) {
            lowTimeAlertedRef.current.clear()
            // Play alert for period transitions (initial overtime entry handled above)
            if (!result.enteredOvertime) {
              play('alert')
            }
          }
          prevDisplayMsRef.current = displayMs

          // Beep at 5, 4, 3, 2, 1 seconds
          if (displaySeconds <= 5 && displaySeconds >= 1) {
            if (!lowTimeAlertedRef.current.has(displaySeconds)) {
              lowTimeAlertedRef.current.add(displaySeconds)
              play('tick')
              callbacksRef.current?.onLowTime?.(activePlayer, displaySeconds)
            }
          }

          return {
            ...prevState,
            [activePlayer]: result.newState,
          }
        })
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = 0
      }
    }
  }, [gameState.status, play])

  // Switch turn (end current player's turn)
  const switchTurn = useCallback(async () => {
    // Initialize audio on first interaction
    await initAudio()

    setGameState((prevState) => {
      if (prevState.status !== 'running') return prevState

      const activePlayer = prevState.activePlayer
      const playerState = prevState[activePlayer]

      // Apply move to current player (increment, period reset, etc.)
      const newPlayerState = onMove(playerState, configRef.current.timeControl)

      // Reset low time alerts for next turn
      lowTimeAlertedRef.current.clear()
      prevDisplayMsRef.current = 0
      cancelScheduled()

      // Play click sound
      play('click')

      return {
        ...prevState,
        [activePlayer]: newPlayerState,
        activePlayer: activePlayer === 'black' ? 'white' : 'black',
      }
    })
  }, [initAudio, play, cancelScheduled])

  // Pause game
  const pause = useCallback(() => {
    cancelScheduled()
    setGameState((prev) => (prev.status === 'running' ? { ...prev, status: 'paused' } : prev))
  }, [cancelScheduled])

  // Resume game
  const resume = useCallback(async () => {
    await initAudio()
    setGameState((prev) => (prev.status === 'paused' ? { ...prev, status: 'running' } : prev))
  }, [initAudio])

  // Reset game with same config
  const reset = useCallback(() => {
    cancelScheduled()
    lowTimeAlertedRef.current.clear()
    enteredOvertimeRef.current.clear()
    prevDisplayMsRef.current = 0
    setGameState(createInitialGameState(config))
  }, [config, cancelScheduled])

  // Start game from waiting state - firstActivePlayer is whose clock runs first
  const start = useCallback(
    async (firstActivePlayer: Player) => {
      await initAudio()
      play('click')
      setGameState((prev) =>
        prev.status === 'waiting'
          ? { ...prev, status: 'running', activePlayer: firstActivePlayer }
          : prev
      )
    },
    [initAudio, play]
  )

  return {
    gameState,
    switchTurn,
    pause,
    resume,
    reset,
    start,
  }
}
