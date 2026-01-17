import { useCallback } from 'react'
import { Pause, Play, RotateCcw, Settings } from 'lucide-react'
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
  const { gameState, switchTurn, pause, resume, reset, start } = useGameClock(config)

  // Keep screen awake during active game
  useWakeLock(gameState.status === 'running')

  const handleTap = useCallback(
    (player: 'black' | 'white') => {
      if (gameState.status === 'waiting') {
        const firstActivePlayer = player === 'black' ? 'white' : 'black'
        start(firstActivePlayer)
      } else if (gameState.status === 'running' && gameState.activePlayer === player) {
        switchTurn()
      }
    },
    [gameState.status, gameState.activePlayer, start, switchTurn]
  )

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
          isWaiting={gameState.status === 'waiting'}
          onTap={() => handleTap('white')}
        />
      </div>

      {/* Center divider with control buttons */}
      <div className="h-[70px] bg-neutral-500 flex items-center justify-center gap-4 z-10">
        {gameState.status !== 'ended' && gameState.status !== 'waiting' && (
          <button
            onClick={handlePauseResume}
            className="p-4 rounded-full bg-neutral-600 hover:bg-neutral-700 active:bg-neutral-800 transition-colors"
            aria-label={gameState.status === 'paused' ? 'Resume' : 'Pause'}
          >
            {gameState.status === 'paused' ? (
              <Play className="w-6 h-6 text-white" />
            ) : (
              <Pause className="w-6 h-6 text-white" />
            )}
          </button>
        )}
        {gameState.status === 'paused' && (
          <>
            <button
              onClick={handleRematch}
              className="p-4 rounded-full bg-neutral-700 hover:bg-neutral-800 active:bg-neutral-900 transition-colors"
              aria-label="Restart"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleNewGame}
              className="p-4 rounded-full bg-neutral-700 hover:bg-neutral-800 active:bg-neutral-900 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-6 h-6 text-white" />
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
          isWaiting={gameState.status === 'waiting'}
          onTap={() => handleTap('black')}
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
