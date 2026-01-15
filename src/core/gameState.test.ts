import { describe, it, expect } from 'vitest'
import {
  createInitialPlayerState,
  createInitialGameState,
  type ByoYomiConfig,
  type CanadianConfig,
  type FischerConfig,
  type GameConfig,
} from './gameState'

describe('createInitialPlayerState', () => {
  it('creates correct state for byoyomi config', () => {
    const config: ByoYomiConfig = {
      type: 'byoyomi',
      mainTimeSeconds: 600,
      periods: 5,
      periodTimeSeconds: 30,
    }
    const state = createInitialPlayerState(config)

    expect(state.mainTimeRemainingMs).toBe(600000)
    expect(state.overtime).toBe(null)
    expect(state.moves).toBe(0)
    expect(state.isInOvertime).toBe(false)
  })

  it('creates correct state for canadian config', () => {
    const config: CanadianConfig = {
      type: 'canadian',
      mainTimeSeconds: 1800,
      stones: 25,
      overtimeSeconds: 300,
    }
    const state = createInitialPlayerState(config)

    expect(state.mainTimeRemainingMs).toBe(1800000)
    expect(state.overtime).toBe(null)
    expect(state.moves).toBe(0)
    expect(state.isInOvertime).toBe(false)
  })

  it('creates correct state for fischer config', () => {
    const config: FischerConfig = {
      type: 'fischer',
      mainTimeSeconds: 300,
      incrementSeconds: 5,
    }
    const state = createInitialPlayerState(config)

    expect(state.mainTimeRemainingMs).toBe(300000)
    expect(state.overtime).toBe(null)
    expect(state.moves).toBe(0)
    expect(state.isInOvertime).toBe(false)
  })

  it('handles zero main time', () => {
    const config: ByoYomiConfig = {
      type: 'byoyomi',
      mainTimeSeconds: 0,
      periods: 5,
      periodTimeSeconds: 30,
    }
    const state = createInitialPlayerState(config)

    expect(state.mainTimeRemainingMs).toBe(0)
    expect(state.isInOvertime).toBe(false)
  })
})

describe('createInitialGameState', () => {
  it('creates correct initial game state', () => {
    const config: GameConfig = {
      timeControl: {
        type: 'byoyomi',
        mainTimeSeconds: 600,
        periods: 5,
        periodTimeSeconds: 30,
      },
      soundProfile: 'subtle',
    }
    const state = createInitialGameState(config)

    expect(state.status).toBe('running')
    expect(state.activePlayer).toBe('black')
    expect(state.winner).toBe(null)
  })

  it('initializes both players with same time', () => {
    const config: GameConfig = {
      timeControl: {
        type: 'fischer',
        mainTimeSeconds: 300,
        incrementSeconds: 5,
      },
      soundProfile: 'silent',
    }
    const state = createInitialGameState(config)

    expect(state.black.mainTimeRemainingMs).toBe(300000)
    expect(state.white.mainTimeRemainingMs).toBe(300000)
    expect(state.black.moves).toBe(0)
    expect(state.white.moves).toBe(0)
  })

  it('black always starts first', () => {
    const config: GameConfig = {
      timeControl: {
        type: 'canadian',
        mainTimeSeconds: 1800,
        stones: 25,
        overtimeSeconds: 300,
      },
      soundProfile: 'intense',
    }
    const state = createInitialGameState(config)

    expect(state.activePlayer).toBe('black')
  })
})
