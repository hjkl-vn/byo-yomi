type Props = {
  winnerText: string
  onNewGame: () => void
  onRematch: () => void
}

export function GameOverModal({ winnerText, onNewGame, onRematch }: Props) {
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
      <div className="bg-neutral-800 rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
        <p className="text-xl text-neutral-300 mb-8">{winnerText}</p>

        <div className="space-y-3">
          <button
            onClick={onRematch}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
          >
            Rematch
          </button>
          <button
            onClick={onNewGame}
            className="w-full bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  )
}
