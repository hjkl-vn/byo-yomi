import { useState } from 'react'
import { ConfigScreen } from './components/ConfigScreen'
import { GameBoard } from './components/GameBoard'
import type { GameConfig } from './core/gameState'

type Screen = 'config' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('config')
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config)
    setScreen('game')
  }

  const handleBackToConfig = () => {
    setScreen('config')
  }

  return (
    <div className="h-full w-full">
      {screen === 'config' && <ConfigScreen onStartGame={handleStartGame} />}
      {screen === 'game' && gameConfig && (
        <GameBoard config={gameConfig} onBackToConfig={handleBackToConfig} />
      )}
    </div>
  )
}

export default App
