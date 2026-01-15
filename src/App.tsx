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
    <div className="h-full w-full bg-neutral-950 lg:flex lg:items-center lg:justify-center">
      <div className="h-full w-full lg:h-[90vh] lg:max-h-[844px] lg:w-[390px] lg:rounded-[3rem] lg:border-4 lg:border-neutral-700 lg:shadow-2xl lg:overflow-hidden">
        {screen === 'config' && <ConfigScreen onStartGame={handleStartGame} />}
        {screen === 'game' && gameConfig && (
          <GameBoard config={gameConfig} onBackToConfig={handleBackToConfig} />
        )}
      </div>
    </div>
  )
}

export default App
