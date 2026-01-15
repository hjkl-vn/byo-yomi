import { useState, useEffect } from 'react'
import type {
  GameConfig,
  TimeControlType,
  TimeControlConfig,
  SoundProfile,
} from '../core/gameState'

type Props = {
  onStartGame: (config: GameConfig) => void
}

const STORAGE_KEY = 'byo-yomi-config'

type StoredConfig = {
  timeControlType: TimeControlType
  mainTimeMinutes: number
  mainTimeSeconds: number
  // Byo-yomi
  byoYomiPeriods: number
  byoYomiPeriodSeconds: number
  // Canadian
  canadianStones: number
  canadianOvertimeMinutes: number
  canadianOvertimeSeconds: number
  // Fischer
  fischerIncrementSeconds: number
  // Sound
  soundProfile: SoundProfile
}

const DEFAULT_CONFIG: StoredConfig = {
  timeControlType: 'byoyomi',
  mainTimeMinutes: 10,
  mainTimeSeconds: 0,
  byoYomiPeriods: 5,
  byoYomiPeriodSeconds: 30,
  canadianStones: 25,
  canadianOvertimeMinutes: 5,
  canadianOvertimeSeconds: 0,
  fischerIncrementSeconds: 10,
  soundProfile: 'subtle',
}

function loadConfig(): StoredConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_CONFIG
}

function saveConfig(config: StoredConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore errors
  }
}

export function ConfigScreen({ onStartGame }: Props) {
  const [config, setConfig] = useState<StoredConfig>(loadConfig)

  // Save to localStorage whenever config changes
  useEffect(() => {
    saveConfig(config)
  }, [config])

  const updateConfig = <K extends keyof StoredConfig>(
    key: K,
    value: StoredConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleStart = () => {
    const mainTimeSeconds = config.mainTimeMinutes * 60 + config.mainTimeSeconds

    let timeControl: TimeControlConfig
    switch (config.timeControlType) {
      case 'byoyomi':
        timeControl = {
          type: 'byoyomi',
          mainTimeSeconds,
          periods: config.byoYomiPeriods,
          periodTimeSeconds: config.byoYomiPeriodSeconds,
        }
        break
      case 'canadian':
        timeControl = {
          type: 'canadian',
          mainTimeSeconds,
          stones: config.canadianStones,
          overtimeSeconds:
            config.canadianOvertimeMinutes * 60 + config.canadianOvertimeSeconds,
        }
        break
      case 'fischer':
        timeControl = {
          type: 'fischer',
          mainTimeSeconds,
          incrementSeconds: config.fischerIncrementSeconds,
        }
        break
    }

    onStartGame({
      timeControl,
      soundProfile: config.soundProfile,
    })
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="p-6 text-center border-b border-neutral-700">
        <h1 className="text-3xl font-bold">Byo-yomi</h1>
        <p className="text-neutral-400 mt-1">Go Game Clock</p>
      </div>

      {/* Form */}
      <div className="flex-1 p-6 space-y-6">
        {/* Time Control Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Time Control
          </label>
          <select
            value={config.timeControlType}
            onChange={(e) =>
              updateConfig('timeControlType', e.target.value as TimeControlType)
            }
            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="byoyomi">Byo-yomi</option>
            <option value="canadian">Canadian Byo-yomi</option>
            <option value="fischer">Fischer</option>
          </select>
        </div>

        {/* Main Time */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Main Time
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              max="999"
              value={config.mainTimeMinutes}
              onChange={(e) =>
                updateConfig('mainTimeMinutes', parseInt(e.target.value) || 0)
              }
              className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-400">min</span>
            <input
              type="number"
              min="0"
              max="59"
              value={config.mainTimeSeconds}
              onChange={(e) =>
                updateConfig('mainTimeSeconds', parseInt(e.target.value) || 0)
              }
              className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-400">sec</span>
          </div>
        </div>

        {/* Byo-yomi Settings */}
        {config.timeControlType === 'byoyomi' && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Periods
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={config.byoYomiPeriods}
                onChange={(e) =>
                  updateConfig('byoYomiPeriods', parseInt(e.target.value) || 1)
                }
                className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Time per Period
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={config.byoYomiPeriodSeconds}
                  onChange={(e) =>
                    updateConfig(
                      'byoYomiPeriodSeconds',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-neutral-400">sec</span>
              </div>
            </div>
          </>
        )}

        {/* Canadian Settings */}
        {config.timeControlType === 'canadian' && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Stones per Period
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={config.canadianStones}
                onChange={(e) =>
                  updateConfig('canadianStones', parseInt(e.target.value) || 1)
                }
                className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Overtime Duration
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={config.canadianOvertimeMinutes}
                  onChange={(e) =>
                    updateConfig(
                      'canadianOvertimeMinutes',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-neutral-400">min</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={config.canadianOvertimeSeconds}
                  onChange={(e) =>
                    updateConfig(
                      'canadianOvertimeSeconds',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-neutral-400">sec</span>
              </div>
            </div>
          </>
        )}

        {/* Fischer Settings */}
        {config.timeControlType === 'fischer' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Increment per Move
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="999"
                value={config.fischerIncrementSeconds}
                onChange={(e) =>
                  updateConfig(
                    'fischerIncrementSeconds',
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-neutral-400">sec</span>
            </div>
          </div>
        )}

        {/* Sound Profile */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Sound Profile
          </label>
          <select
            value={config.soundProfile}
            onChange={(e) =>
              updateConfig('soundProfile', e.target.value as SoundProfile)
            }
            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="silent">Silent</option>
            <option value="subtle">Subtle</option>
            <option value="intense">Intense</option>
          </select>
        </div>
      </div>

      {/* Start Button */}
      <div className="p-6 border-t border-neutral-700">
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
