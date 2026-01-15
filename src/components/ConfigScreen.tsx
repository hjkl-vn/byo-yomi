import { useState, useEffect } from 'react'
import { Info, X, Github, Mail } from 'lucide-react'
import type {
  GameConfig,
  TimeControlType,
  TimeControlConfig,
  SoundProfile,
} from '../core/gameState'

const APP_VERSION = __APP_VERSION__

type Props = {
  onStartGame: (config: GameConfig) => void
}

function MastodonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z" />
    </svg>
  )
}

type NumberInputProps = {
  id: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  className?: string
}

function NumberInput({ id, value, onChange, min, max, className }: NumberInputProps) {
  const [localValue, setLocalValue] = useState(String(value))

  // Sync local value when prop changes (e.g., reset)
  useEffect(() => {
    setLocalValue(String(value))
  }, [value])

  const handleBlur = () => {
    const parsed = parseInt(localValue, 10)
    if (isNaN(parsed) || localValue === '') {
      // Empty or invalid: reset to min
      setLocalValue(String(min))
      onChange(min)
    } else {
      // Clamp to min/max
      const clamped = Math.max(min, Math.min(max, parsed))
      setLocalValue(String(clamped))
      onChange(clamped)
    }
  }

  return (
    <input
      id={id}
      name={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className={className}
    />
  )
}

const STORAGE_KEY = 'byoyomi-config'

// Common presets for each time control type
type ByoyomiPreset = {
  label: string
  mainTimeMinutes: number
  periods: number
  periodSeconds: number
}

type CanadianPreset = {
  label: string
  mainTimeMinutes: number
  stones: number
  overtimeMinutes: number
}

type FischerPreset = {
  label: string
  mainTimeMinutes: number
  incrementSeconds: number
}

const BYOYOMI_PRESETS: ByoyomiPreset[] = [
  { label: 'Blitz 5m+3×10s', mainTimeMinutes: 5, periods: 3, periodSeconds: 10 },
  { label: 'Quick 10m+5×30s', mainTimeMinutes: 10, periods: 5, periodSeconds: 30 },
  { label: 'Standard 30m+5×30s', mainTimeMinutes: 30, periods: 5, periodSeconds: 30 },
  { label: 'Tournament 45m+5×60s', mainTimeMinutes: 45, periods: 5, periodSeconds: 60 },
]

const CANADIAN_PRESETS: CanadianPreset[] = [
  { label: 'Quick 15m+5m/15st', mainTimeMinutes: 15, stones: 15, overtimeMinutes: 5 },
  { label: 'Standard 30m+5m/25st', mainTimeMinutes: 30, stones: 25, overtimeMinutes: 5 },
  { label: 'Tournament 60m+10m/25st', mainTimeMinutes: 60, stones: 25, overtimeMinutes: 10 },
]

const FISCHER_PRESETS: FischerPreset[] = [
  { label: 'Blitz 5m+5s', mainTimeMinutes: 5, incrementSeconds: 5 },
  { label: 'Quick 10m+10s', mainTimeMinutes: 10, incrementSeconds: 10 },
  { label: 'Standard 30m+30s', mainTimeMinutes: 30, incrementSeconds: 30 },
  { label: 'Long 45m+30s', mainTimeMinutes: 45, incrementSeconds: 30 },
]

type StoredConfig = {
  timeControlType: TimeControlType
  mainTimeMinutes: number
  mainTimeSeconds: number
  // Byoyomi
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
  const [showAbout, setShowAbout] = useState(false)

  // Save to localStorage whenever config changes
  useEffect(() => {
    saveConfig(config)
  }, [config])

  const updateConfig = <K extends keyof StoredConfig>(key: K, value: StoredConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const applyByoyomiPreset = (preset: ByoyomiPreset) => {
    setConfig((prev) => ({
      ...prev,
      mainTimeMinutes: preset.mainTimeMinutes,
      mainTimeSeconds: 0,
      byoYomiPeriods: preset.periods,
      byoYomiPeriodSeconds: preset.periodSeconds,
    }))
  }

  const applyCanadianPreset = (preset: CanadianPreset) => {
    setConfig((prev) => ({
      ...prev,
      mainTimeMinutes: preset.mainTimeMinutes,
      mainTimeSeconds: 0,
      canadianStones: preset.stones,
      canadianOvertimeMinutes: preset.overtimeMinutes,
      canadianOvertimeSeconds: 0,
    }))
  }

  const applyFischerPreset = (preset: FischerPreset) => {
    setConfig((prev) => ({
      ...prev,
      mainTimeMinutes: preset.mainTimeMinutes,
      mainTimeSeconds: 0,
      fischerIncrementSeconds: preset.incrementSeconds,
    }))
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
          overtimeSeconds: config.canadianOvertimeMinutes * 60 + config.canadianOvertimeSeconds,
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
      <div className="p-6 xl:p-4 border-b border-neutral-700 text-center">
        <h1 className="text-3xl xl:text-2xl font-bold">Byoyomi Clock Online</h1>
        <div className="flex items-center justify-center gap-1 mt-1">
          <p className="text-neutral-400">HJKL Labs</p>
          <button
            onClick={() => setShowAbout(true)}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="About"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-6 xl:p-4 space-y-6 xl:space-y-3">
        {/* Clock Settings Section */}
        <div className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
          Clock Settings
        </div>

        {/* Time Control Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2 xl:mb-1">
            Time Control
          </label>
          <select
            id="timeControlType"
            name="timeControlType"
            value={config.timeControlType}
            onChange={(e) => updateConfig('timeControlType', e.target.value as TimeControlType)}
            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="byoyomi">Byoyomi</option>
            <option value="canadian">Canadian Byoyomi</option>
            <option value="fischer">Fischer</option>
          </select>
        </div>

        {/* Main Time */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2 xl:mb-1">
            Main Time
          </label>
          <div className="flex gap-2 items-center">
            <NumberInput
              id="mainTimeMinutes"
              value={config.mainTimeMinutes}
              onChange={(v) => updateConfig('mainTimeMinutes', v)}
              min={0}
              max={999}
              className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-400">minutes</span>
            <NumberInput
              id="mainTimeSeconds"
              value={config.mainTimeSeconds}
              onChange={(v) => updateConfig('mainTimeSeconds', v)}
              min={0}
              max={59}
              className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-400">seconds</span>
          </div>
        </div>

        {/* Byoyomi Settings */}
        {config.timeControlType === 'byoyomi' && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 xl:mb-1">
                Periods
              </label>
              <NumberInput
                id="byoYomiPeriods"
                value={config.byoYomiPeriods}
                onChange={(v) => updateConfig('byoYomiPeriods', v)}
                min={1}
                max={99}
                className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 xl:mb-1">
                Time per Period
              </label>
              <div className="flex gap-2 items-center">
                <NumberInput
                  id="byoYomiPeriodSeconds"
                  value={config.byoYomiPeriodSeconds}
                  onChange={(v) => updateConfig('byoYomiPeriodSeconds', v)}
                  min={1}
                  max={999}
                  className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-neutral-400">seconds</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300 mb-2 xl:mb-1">Presets</p>
              <ul className="text-sm space-y-1">
                {BYOYOMI_PRESETS.map((preset) => (
                  <li key={preset.label}>
                    <button
                      type="button"
                      onClick={() => applyByoyomiPreset(preset)}
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      {preset.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Canadian Settings */}
        {config.timeControlType === 'canadian' && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 xl:mb-1">
                Stones per Period
              </label>
              <NumberInput
                id="canadianStones"
                value={config.canadianStones}
                onChange={(v) => updateConfig('canadianStones', v)}
                min={1}
                max={99}
                className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 xl:mb-1">
                Overtime Duration
              </label>
              <div className="flex gap-2 items-center">
                <NumberInput
                  id="canadianOvertimeMinutes"
                  value={config.canadianOvertimeMinutes}
                  onChange={(v) => updateConfig('canadianOvertimeMinutes', v)}
                  min={0}
                  max={999}
                  className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-neutral-400">minutes</span>
                <NumberInput
                  id="canadianOvertimeSeconds"
                  value={config.canadianOvertimeSeconds}
                  onChange={(v) => updateConfig('canadianOvertimeSeconds', v)}
                  min={0}
                  max={59}
                  className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-neutral-400">seconds</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300 mb-2 xl:mb-1">Presets</p>
              <ul className="text-sm space-y-1">
                {CANADIAN_PRESETS.map((preset) => (
                  <li key={preset.label}>
                    <button
                      type="button"
                      onClick={() => applyCanadianPreset(preset)}
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      {preset.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Fischer Settings */}
        {config.timeControlType === 'fischer' && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 xl:mb-1">
                Increment per Move
              </label>
              <div className="flex gap-2 items-center">
                <NumberInput
                  id="fischerIncrementSeconds"
                  value={config.fischerIncrementSeconds}
                  onChange={(v) => updateConfig('fischerIncrementSeconds', v)}
                  min={0}
                  max={999}
                  className="w-24 bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-neutral-400">seconds</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300 mb-2 xl:mb-1">Presets</p>
              <ul className="text-sm space-y-1">
                {FISCHER_PRESETS.map((preset) => (
                  <li key={preset.label}>
                    <button
                      type="button"
                      onClick={() => applyFischerPreset(preset)}
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      {preset.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Sound Section Divider */}
        <div className="border-t border-neutral-700 pt-6 xl:pt-3">
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4 xl:mb-2">
            Sound
          </div>
        </div>

        {/* Sound Profile */}
        <div className="-mt-2">
          <label className="block text-sm font-medium text-neutral-300 mb-2 xl:mb-1">
            Sound Profile
          </label>
          <select
            id="soundProfile"
            name="soundProfile"
            value={config.soundProfile}
            onChange={(e) => updateConfig('soundProfile', e.target.value as SoundProfile)}
            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg p-3 xl:p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="silent">Silent – No sounds</option>
            <option value="subtle">Subtle – Quiet beeps and countdown</option>
            <option value="intense">Intense – Louder for noisy environments</option>
          </select>
        </div>
      </div>

      {/* Start Button */}
      <div className="p-6 xl:p-4 border-t border-neutral-700">
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 xl:py-3 px-8 rounded-lg text-xl transition-colors"
        >
          Start Game
        </button>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-neutral-800 rounded-xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAbout(false)}
              className="absolute right-4 top-4 p-1 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Byoyomi (秒読み)</h2>
              <p className="text-neutral-400 mt-1">v{APP_VERSION}</p>
            </div>

            <div className="text-center mb-6">
              <p className="text-neutral-300">
                Created by <span className="text-white font-medium">Thang Do</span>
              </p>
            </div>

            <div className="flex justify-center gap-6">
              <a
                href="https://github.com/hjkl-vn/byo-yomi"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-neutral-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={24} />
              </a>
              <a
                href="https://social.linux.pizza/@csessh"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-neutral-400 hover:text-white transition-colors"
                aria-label="Mastodon"
              >
                <MastodonIcon className="w-6 h-6" />
              </a>
              <a
                href="mailto:tdo@hjkl.vn"
                className="p-3 text-neutral-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
