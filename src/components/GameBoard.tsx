import { useCallback } from 'react'
import type { GameConfig, Player } from '../core/gameState'
import { ClockFace } from './ClockFace'
import { GameOverModal } from './GameOverModal'
import { useGameClock } from '../hooks/useGameClock'
import { useWakeLock } from '../hooks/useWakeLock'

type Props = {
  config: GameConfig
  onBackToConfig: () => void
}

export function GameBoard({ config, onBackToConfig }: Props) {
  const { gameState, switchTurn, pause, resume, reset } = useGameClock(config)

  // Keep screen awake during active game
  useWakeLock(gameState.status === 'running')

  const handleWhiteTap = useCallback(() => {
    if (gameState.status === 'running' && gameState.activePlayer === 'white') {
      switchTurn()
    }
  }, [gameState.status, gameState.activePlayer, switchTurn])

  const handleBlackTap = useCallback(() => {
    if (gameState.status === 'running' && gameState.activePlayer === 'black') {
      switchTurn()
    }
  }, [gameState.status, gameState.activePlayer, switchTurn])

  const handlePauseResume = useCallback(() => {
    if (gameState.status === 'running') {
      pause()
    } else if (gameState.status === 'paused') {
      resume()
    }
  }, [gameState.status, pause, resume])

  const handleNewGame = useCallback(() => {
    onBackToConfig()
  }, [onBackToConfig])

  const handleRematch = useCallback(() => {
    reset()
  }, [reset])

  const getWinnerText = (winner: Player): string => {
    return winner === 'black' ? 'Black wins!' : 'White wins!'
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* White player clock (rotated 180°) */}
      <div className="flex-1 min-h-0 rotate-180">
        <ClockFace
          player="white"
          state={gameState.white}
          config={config.timeControl}
          isActive={gameState.activePlayer === 'white' && gameState.status === 'running'}
          onTap={handleWhiteTap}
        />
      </div>

      {/* Center divider with pause button */}
      <div className="h-14 bg-neutral-500 flex items-center justify-center gap-4 z-10">
        {gameState.status !== 'ended' && (
          <button
            onClick={handlePauseResume}
            className="text-white text-sm font-medium px-4 py-2 rounded bg-neutral-600 hover:bg-neutral-700 active:bg-neutral-800 transition-colors"
          >
            {gameState.status === 'paused' ? 'Resume' : 'Pause'}
          </button>
        )}
        {gameState.status === 'paused' && (
          <>
            <button
              onClick={handleRematch}
              className="text-white text-sm font-medium px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-800 active:bg-neutral-900 transition-colors"
            >
              Restart
            </button>
            <button
              onClick={handleNewGame}
              className="text-white text-sm font-medium px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-800 active:bg-neutral-900 transition-colors"
            >
              Settings
            </button>
          </>
        )}
      </div>

      {/* Black player clock (normal orientation) */}
      <div className="flex-1 min-h-0">
        <ClockFace
          player="black"
          state={gameState.black}
          config={config.timeControl}
          isActive={gameState.activePlayer === 'black' && gameState.status === 'running'}
          onTap={handleBlackTap}
        />
      </div>

      {/* Game over modal */}
      {gameState.status === 'ended' && gameState.winner && (
        <GameOverModal
          winnerText={getWinnerText(gameState.winner)}
          onNewGame={handleNewGame}
          onRematch={handleRematch}
        />
      )}
    </div>
  )
}
