import type { PlayerState, TimeControlConfig } from '../core/gameState'
import { formatTime, getDisplayTime } from '../core/timeControl'

type Props = {
  player: 'black' | 'white'
  state: PlayerState
  config: TimeControlConfig
  isActive: boolean
  onTap: () => void
}

export function ClockFace({ player, state, config, isActive, onTap }: Props) {
  const displayTime = getDisplayTime(state)
  const timeString = formatTime(displayTime)

  // Determine if in low time (under 10 seconds)
  const isLowTime = displayTime <= 10000 && displayTime > 0

  // Background colors
  const bgColor = player === 'black' ? 'bg-neutral-900' : 'bg-neutral-100'
  const textColor = player === 'black' ? 'text-neutral-100' : 'text-neutral-900'
  const dimmedOpacity = isActive ? 'opacity-100' : 'opacity-50'

  // Show low time warning in overtime, or in Fischer mode (sudden death)
  const showLowTimeWarning = isLowTime && (state.isInOvertime || config.type === 'fischer')

  // Low time warning color - bright red visible on both backgrounds
  const timeColor = showLowTimeWarning ? 'text-red-500' : textColor

  return (
    <div
      className={`
        @container h-full w-full flex flex-col items-center justify-center px-4
        ${bgColor} ${dimmedOpacity}
        transition-opacity duration-200
        cursor-pointer select-none
        relative
      `}
      onClick={onTap}
    >
      {/* Move counter - bottom edge */}
      <div
        className={`
          absolute bottom-6 left-1/2 -translate-x-1/2 text-lg sm:text-xl
          ${player === 'black' ? 'text-neutral-500' : 'text-neutral-400'}
        `}
      >
        {state.moves} {state.moves === 1 ? 'move' : 'moves'}
      </div>

      {/* Main time display */}
      <div
        className={`
          text-[clamp(2.5rem,20cqw,8rem)] font-bold leading-none ${timeColor}
          ${showLowTimeWarning ? 'animate-slow-pulse' : ''}
        `}
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        {timeString}
      </div>

      {/* Mode-specific info */}
      <div className={`mt-8 text-xl sm:text-2xl ${textColor}`}>
        {renderModeInfo(state, config, player)}
      </div>
    </div>
  )
}

function renderModeInfo(state: PlayerState, config: TimeControlConfig, player: 'black' | 'white') {
  const secondaryColor = player === 'black' ? 'text-neutral-400' : 'text-neutral-500'

  if (config.type === 'byoyomi') {
    if (state.isInOvertime && state.overtime?.type === 'byoyomi') {
      const { periodsRemaining } = state.overtime
      const totalPeriods = config.periods

      // Render period dots
      const dots = []
      for (let i = 0; i < totalPeriods; i++) {
        const isFilled = i < periodsRemaining
        dots.push(
          <span
            key={i}
            className={`
              inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full mx-1.5
              ${
                isFilled
                  ? player === 'black'
                    ? 'bg-blue-400'
                    : 'bg-blue-600'
                  : player === 'black'
                    ? 'bg-neutral-700'
                    : 'bg-neutral-300'
              }
            `}
          />
        )
      }

      return (
        <div className="flex flex-col items-center">
          <div className="flex mb-4">{dots}</div>
          <div className={`text-2xl sm:text-3xl ${secondaryColor}`}>
            Period {totalPeriods - periodsRemaining + 1} of {totalPeriods}
          </div>
        </div>
      )
    } else {
      // In main time
      return (
        <div className={`text-2xl sm:text-3xl ${secondaryColor}`}>
          {config.periods} x {config.periodTimeSeconds}s byoyomi
        </div>
      )
    }
  }

  if (config.type === 'canadian') {
    if (state.isInOvertime && state.overtime?.type === 'canadian') {
      const { stonesRemaining } = state.overtime
      return (
        <div className="text-center">
          <div
            className={`text-4xl sm:text-5xl font-semibold ${player === 'black' ? 'text-neutral-200' : 'text-neutral-700'}`}
          >
            {stonesRemaining} stones left
          </div>
        </div>
      )
    } else {
      return (
        <div className={`text-2xl sm:text-3xl ${secondaryColor}`}>
          {config.stones} stones in {formatTime(config.overtimeSeconds * 1000)}
        </div>
      )
    }
  }

  if (config.type === 'fischer') {
    return (
      <div className={`text-2xl sm:text-3xl ${secondaryColor}`}>
        +{config.incrementSeconds}s per move
      </div>
    )
  }

  return null
}
