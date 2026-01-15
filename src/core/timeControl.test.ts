import { describe, it, expect } from 'vitest'
import { tick, onMove, formatTime, getDisplayTime } from './timeControl'
import type { PlayerState, ByoYomiConfig, CanadianConfig, FischerConfig } from './gameState'

// Helper to create a fresh player state
function createPlayerState(mainTimeMs: number): PlayerState {
  return {
    mainTimeRemainingMs: mainTimeMs,
    overtime: null,
    moves: 0,
    isInOvertime: false,
  }
}

describe('formatTime', () => {
  it('formats seconds correctly', () => {
    expect(formatTime(30000)).toBe('0:30')
    expect(formatTime(5000)).toBe('0:05')
    expect(formatTime(1000)).toBe('0:01')
  })

  it('formats minutes and seconds correctly', () => {
    expect(formatTime(60000)).toBe('1:00')
    expect(formatTime(90000)).toBe('1:30')
    expect(formatTime(600000)).toBe('10:00')
    expect(formatTime(3599000)).toBe('59:59')
  })

  it('formats hours correctly', () => {
    expect(formatTime(3600000)).toBe('1:00:00')
    expect(formatTime(3661000)).toBe('1:01:01')
    expect(formatTime(7200000)).toBe('2:00:00')
  })

  it('handles zero and negative values', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(-1000)).toBe('0:00')
    expect(formatTime(-5000)).toBe('0:00')
  })

  it('rounds up milliseconds', () => {
    expect(formatTime(1500)).toBe('0:02')
    expect(formatTime(1001)).toBe('0:02')
    expect(formatTime(999)).toBe('0:01')
  })
})

describe('getDisplayTime', () => {
  it('returns main time when not in overtime', () => {
    const state = createPlayerState(60000)
    expect(getDisplayTime(state)).toBe(60000)
  })

  it('returns period time for byoyomi overtime', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'byoyomi',
        periodsRemaining: 3,
        periodTimeRemainingMs: 25000,
      },
    }
    expect(getDisplayTime(state)).toBe(25000)
  })

  it('returns overtime remaining for canadian overtime', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'canadian',
        stonesRemaining: 10,
        overtimeRemainingMs: 180000,
      },
    }
    expect(getDisplayTime(state)).toBe(180000)
  })
})

describe('tick - main time', () => {
  const byoyomiConfig: ByoYomiConfig = {
    type: 'byoyomi',
    mainTimeSeconds: 60,
    periods: 3,
    periodTimeSeconds: 30,
  }

  it('decrements main time correctly', () => {
    const state = createPlayerState(60000)
    const result = tick(state, byoyomiConfig, 1000)

    expect(result.newState.mainTimeRemainingMs).toBe(59000)
    expect(result.expired).toBe(false)
    expect(result.enteredOvertime).toBe(false)
  })

  it('enters overtime when main time exhausted (byoyomi)', () => {
    const state = createPlayerState(1000)
    const result = tick(state, byoyomiConfig, 1000)

    expect(result.newState.mainTimeRemainingMs).toBe(0)
    expect(result.newState.isInOvertime).toBe(true)
    expect(result.enteredOvertime).toBe(true)
    expect(result.expired).toBe(false)
    expect(result.newState.overtime).toEqual({
      type: 'byoyomi',
      periodsRemaining: 3,
      periodTimeRemainingMs: 30000,
    })
  })

  it('applies overflow to overtime when entering', () => {
    const state = createPlayerState(500)
    const result = tick(state, byoyomiConfig, 1000)

    expect(result.newState.mainTimeRemainingMs).toBe(0)
    expect(result.newState.isInOvertime).toBe(true)
    // 500ms overflow applied to 30000ms period time
    expect(result.newState.overtime?.type).toBe('byoyomi')
    if (result.newState.overtime?.type === 'byoyomi') {
      expect(result.newState.overtime.periodTimeRemainingMs).toBe(29500)
    }
  })
})

describe('tick - byoyomi overtime', () => {
  const config: ByoYomiConfig = {
    type: 'byoyomi',
    mainTimeSeconds: 60,
    periods: 3,
    periodTimeSeconds: 30,
  }

  it('decrements period time in overtime', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'byoyomi',
        periodsRemaining: 3,
        periodTimeRemainingMs: 30000,
      },
    }
    const result = tick(state, config, 5000)

    expect(result.newState.overtime?.type).toBe('byoyomi')
    if (result.newState.overtime?.type === 'byoyomi') {
      expect(result.newState.overtime.periodTimeRemainingMs).toBe(25000)
      expect(result.newState.overtime.periodsRemaining).toBe(3)
    }
    expect(result.expired).toBe(false)
  })

  it('consumes a period when period time expires', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'byoyomi',
        periodsRemaining: 3,
        periodTimeRemainingMs: 1000,
      },
    }
    const result = tick(state, config, 1000)

    expect(result.newState.overtime?.type).toBe('byoyomi')
    if (result.newState.overtime?.type === 'byoyomi') {
      expect(result.newState.overtime.periodsRemaining).toBe(2)
      expect(result.newState.overtime.periodTimeRemainingMs).toBe(30000)
    }
    expect(result.expired).toBe(false)
  })

  it('expires when all periods consumed', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'byoyomi',
        periodsRemaining: 1,
        periodTimeRemainingMs: 1000,
      },
    }
    const result = tick(state, config, 1000)

    expect(result.expired).toBe(true)
    if (result.newState.overtime?.type === 'byoyomi') {
      expect(result.newState.overtime.periodsRemaining).toBe(0)
    }
  })
})

describe('tick - canadian overtime', () => {
  const config: CanadianConfig = {
    type: 'canadian',
    mainTimeSeconds: 60,
    stones: 25,
    overtimeSeconds: 300,
  }

  it('enters canadian overtime correctly', () => {
    const state = createPlayerState(1000)
    const result = tick(state, config, 1000)

    expect(result.newState.isInOvertime).toBe(true)
    expect(result.newState.overtime).toEqual({
      type: 'canadian',
      stonesRemaining: 25,
      overtimeRemainingMs: 300000,
    })
  })

  it('decrements overtime in canadian mode', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'canadian',
        stonesRemaining: 25,
        overtimeRemainingMs: 300000,
      },
    }
    const result = tick(state, config, 10000)

    if (result.newState.overtime?.type === 'canadian') {
      expect(result.newState.overtime.overtimeRemainingMs).toBe(290000)
      expect(result.newState.overtime.stonesRemaining).toBe(25)
    }
    expect(result.expired).toBe(false)
  })

  it('expires when canadian overtime runs out', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'canadian',
        stonesRemaining: 10,
        overtimeRemainingMs: 1000,
      },
    }
    const result = tick(state, config, 1000)

    expect(result.expired).toBe(true)
  })
})

describe('tick - fischer', () => {
  const config: FischerConfig = {
    type: 'fischer',
    mainTimeSeconds: 60,
    incrementSeconds: 10,
  }

  it('expires immediately when main time runs out', () => {
    const state = createPlayerState(1000)
    const result = tick(state, config, 1000)

    expect(result.expired).toBe(true)
    expect(result.newState.isInOvertime).toBe(true)
    expect(result.newState.overtime).toBe(null)
  })
})

describe('onMove - fischer', () => {
  const config: FischerConfig = {
    type: 'fischer',
    mainTimeSeconds: 60,
    incrementSeconds: 10,
  }

  it('adds increment to main time', () => {
    const state = createPlayerState(50000)
    const result = onMove(state, config)

    expect(result.mainTimeRemainingMs).toBe(60000) // 50000 + 10000
    expect(result.moves).toBe(1)
  })

  it('increments move counter', () => {
    const state = { ...createPlayerState(60000), moves: 5 }
    const result = onMove(state, config)

    expect(result.moves).toBe(6)
  })
})

describe('onMove - byoyomi', () => {
  const config: ByoYomiConfig = {
    type: 'byoyomi',
    mainTimeSeconds: 60,
    periods: 3,
    periodTimeSeconds: 30,
  }

  it('does not modify main time during main time', () => {
    const state = createPlayerState(50000)
    const result = onMove(state, config)

    expect(result.mainTimeRemainingMs).toBe(50000)
    expect(result.moves).toBe(1)
  })

  it('resets period time in overtime', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'byoyomi',
        periodsRemaining: 3,
        periodTimeRemainingMs: 5000, // Used up most of period
      },
    }
    const result = onMove(state, config)

    if (result.overtime?.type === 'byoyomi') {
      expect(result.overtime.periodTimeRemainingMs).toBe(30000) // Reset
      expect(result.overtime.periodsRemaining).toBe(3) // Period not consumed
    }
    expect(result.moves).toBe(1)
  })
})

describe('onMove - canadian', () => {
  const config: CanadianConfig = {
    type: 'canadian',
    mainTimeSeconds: 60,
    stones: 25,
    overtimeSeconds: 300,
  }

  it('decrements stones remaining', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'canadian',
        stonesRemaining: 25,
        overtimeRemainingMs: 280000,
      },
    }
    const result = onMove(state, config)

    if (result.overtime?.type === 'canadian') {
      expect(result.overtime.stonesRemaining).toBe(24)
      expect(result.overtime.overtimeRemainingMs).toBe(280000) // Unchanged
    }
  })

  it('resets period when all stones played', () => {
    const state: PlayerState = {
      ...createPlayerState(0),
      isInOvertime: true,
      overtime: {
        type: 'canadian',
        stonesRemaining: 1,
        overtimeRemainingMs: 50000,
      },
    }
    const result = onMove(state, config)

    if (result.overtime?.type === 'canadian') {
      expect(result.overtime.stonesRemaining).toBe(25) // Reset
      expect(result.overtime.overtimeRemainingMs).toBe(300000) // Reset
    }
  })
})
