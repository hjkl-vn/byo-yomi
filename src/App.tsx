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
    <div className="h-full w-full bg-neutral-950 xl:flex xl:items-center xl:justify-center">
      <div className="h-full w-full xl:h-[90vh] xl:max-h-[844px] xl:w-[390px] xl:rounded-[3rem] xl:border-4 xl:border-neutral-700 xl:shadow-2xl xl:overflow-hidden">
        {screen === 'config' && <ConfigScreen onStartGame={handleStartGame} />}
        {screen === 'game' && gameConfig && (
          <GameBoard config={gameConfig} onBackToConfig={handleBackToConfig} />
        )}
      </div>
    </div>
  )
}

export default App
