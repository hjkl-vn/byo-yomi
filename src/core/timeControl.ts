import type { TimeControlConfig, PlayerState, ByoYomiOvertime, CanadianOvertime } from './gameState'

export type TickResult = {
  newState: PlayerState
  expired: boolean
  enteredOvertime: boolean
}

/**
 * Tick the clock for a player by the given delta time.
 * Returns the new player state and whether time expired.
 */
export function tick(state: PlayerState, config: TimeControlConfig, deltaMs: number): TickResult {
  let newState = { ...state }
  let expired = false
  let enteredOvertime = false

  if (newState.isInOvertime) {
    // Already in overtime
    const result = tickOvertime(newState, config, deltaMs)
    newState = result.newState
    expired = result.expired
  } else {
    // In main time
    newState.mainTimeRemainingMs -= deltaMs

    if (newState.mainTimeRemainingMs <= 0) {
      // Main time exhausted, enter overtime
      const overflow = -newState.mainTimeRemainingMs
      newState.mainTimeRemainingMs = 0
      newState.isInOvertime = true
      enteredOvertime = true

      // Initialize overtime state
      newState.overtime = createOvertimeState(config)

      if (newState.overtime) {
        // Apply overflow to overtime
        const result = tickOvertime(newState, config, overflow)
        newState = result.newState
        expired = result.expired
      } else {
        // Fischer has no overtime concept - time expired
        expired = true
      }
    }
  }

  return { newState, expired, enteredOvertime }
}

/**
 * Handle a move being made (turn end).
 * Resets periods for byo-yomi, adds increment for Fischer, etc.
 */
export function onMove(state: PlayerState, config: TimeControlConfig): PlayerState {
  const newState = { ...state, moves: state.moves + 1 }

  if (config.type === 'fischer' && !newState.isInOvertime) {
    // Add increment to main time
    newState.mainTimeRemainingMs += config.incrementSeconds * 1000
  } else if (
    config.type === 'byoyomi' &&
    newState.isInOvertime &&
    newState.overtime?.type === 'byoyomi'
  ) {
    // Reset period time (period not consumed if move made in time)
    newState.overtime = {
      ...newState.overtime,
      periodTimeRemainingMs: config.periodTimeSeconds * 1000,
    }
  } else if (
    config.type === 'canadian' &&
    newState.isInOvertime &&
    newState.overtime?.type === 'canadian'
  ) {
    // Decrement stones remaining
    const stones = newState.overtime.stonesRemaining - 1
    if (stones <= 0) {
      // Period complete, reset
      newState.overtime = {
        type: 'canadian',
        stonesRemaining: config.stones,
        overtimeRemainingMs: config.overtimeSeconds * 1000,
      }
    } else {
      newState.overtime = {
        ...newState.overtime,
        stonesRemaining: stones,
      }
    }
  }

  return newState
}

/**
 * Tick overtime state.
 */
function tickOvertime(
  state: PlayerState,
  config: TimeControlConfig,
  deltaMs: number
): { newState: PlayerState; expired: boolean } {
  const newState = { ...state }
  let expired = false

  if (config.type === 'byoyomi' && newState.overtime?.type === 'byoyomi') {
    const overtime = { ...newState.overtime }
    overtime.periodTimeRemainingMs -= deltaMs

    while (overtime.periodTimeRemainingMs <= 0 && overtime.periodsRemaining > 0) {
      // Period expired, consume one
      overtime.periodsRemaining -= 1
      if (overtime.periodsRemaining > 0) {
        // Reset to next period
        overtime.periodTimeRemainingMs += config.periodTimeSeconds * 1000
      }
    }

    if (overtime.periodsRemaining <= 0) {
      expired = true
      overtime.periodTimeRemainingMs = 0
    }

    newState.overtime = overtime
  } else if (config.type === 'canadian' && newState.overtime?.type === 'canadian') {
    const overtime = { ...newState.overtime }
    overtime.overtimeRemainingMs -= deltaMs

    if (overtime.overtimeRemainingMs <= 0) {
      expired = true
      overtime.overtimeRemainingMs = 0
    }

    newState.overtime = overtime
  } else if (config.type === 'fischer') {
    // Fischer has no overtime - if main time is 0 and we're here, expired
    expired = true
  }

  return { newState, expired }
}

/**
 * Create initial overtime state based on config.
 */
function createOvertimeState(config: TimeControlConfig): ByoYomiOvertime | CanadianOvertime | null {
  switch (config.type) {
    case 'byoyomi':
      return {
        type: 'byoyomi',
        periodsRemaining: config.periods,
        periodTimeRemainingMs: config.periodTimeSeconds * 1000,
      }
    case 'canadian':
      return {
        type: 'canadian',
        stonesRemaining: config.stones,
        overtimeRemainingMs: config.overtimeSeconds * 1000,
      }
    case 'fischer':
      // Fischer doesn't have overtime periods
      return null
  }
}

/**
 * Format milliseconds to MM:SS or H:MM:SS display string.
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Get the display time for a player (main time or overtime time).
 */
export function getDisplayTime(state: PlayerState): number {
  if (!state.isInOvertime) {
    return state.mainTimeRemainingMs
  }

  if (state.overtime?.type === 'byoyomi') {
    return state.overtime.periodTimeRemainingMs
  }

  if (state.overtime?.type === 'canadian') {
    return state.overtime.overtimeRemainingMs
  }

  // Fischer - just show main time (which would be 0 or less)
  return state.mainTimeRemainingMs
}
