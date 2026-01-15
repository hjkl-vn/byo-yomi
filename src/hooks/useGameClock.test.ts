import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameClock } from './useGameClock'
import type { GameConfig } from '../core/gameState'

// Mock useAudio hook
const mockPlay = vi.fn()
const mockInitAudio = vi.fn().mockResolvedValue(undefined)
const mockCancelScheduled = vi.fn()

vi.mock('./useAudio', () => ({
  useAudio: () => ({
    initAudio: mockInitAudio,
    play: mockPlay,
    cancelScheduled: mockCancelScheduled,
  }),
}))

// Helper to create byoyomi config
function createByoyomiConfig(
  mainTimeSeconds: number,
  periods: number,
  periodTimeSeconds: number
): GameConfig {
  return {
    timeControl: {
      type: 'byoyomi',
      mainTimeSeconds,
      periods,
      periodTimeSeconds,
    },
    soundProfile: 'subtle',
  }
}

// Helper to simulate game loop ticks via requestAnimationFrame
function simulateTime(ms: number) {
  // Advance timers which triggers requestAnimationFrame callbacks
  vi.advanceTimersByTime(ms)
}

describe('useGameClock countdown beeps', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    // Mock requestAnimationFrame to use setTimeout
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id)
    })
    // Mock performance.now to advance with fake timers
    let mockTime = 0
    vi.spyOn(performance, 'now').mockImplementation(() => {
      mockTime += 16
      return mockTime
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('plays tick sound at 5, 4, 3, 2, 1 seconds during main time', async () => {
    // Start with 6 seconds main time
    const config = createByoyomiConfig(6, 3, 30)
    const { result } = renderHook(() => useGameClock(config))

    // Start the game
    await act(async () => {
      await result.current.start()
    })

    mockPlay.mockClear()

    // Run for ~6 seconds worth of frames
    await act(async () => {
      for (let i = 0; i < 400; i++) {
        simulateTime(16)
      }
    })

    // Should have played tick sounds for 5, 4, 3, 2, 1
    const tickCalls = mockPlay.mock.calls.filter((call) => call[0] === 'tick')
    expect(tickCalls.length).toBe(5)
  })

  it('plays alert sound when entering overtime', async () => {
    // Start with 1 second main time to quickly enter overtime
    const config = createByoyomiConfig(1, 3, 30)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    mockPlay.mockClear()

    // Run until overtime is entered
    await act(async () => {
      for (let i = 0; i < 100; i++) {
        simulateTime(16)
      }
    })

    const alertCalls = mockPlay.mock.calls.filter((call) => call[0] === 'alert')
    expect(alertCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('plays alert sound when byoyomi period is consumed', async () => {
    // Start with 0 main time, 3 periods of 1 second each
    const config = createByoyomiConfig(0, 3, 1)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    // First alert is for entering overtime
    mockPlay.mockClear()

    // Run for ~2 seconds to consume first period and start second
    await act(async () => {
      for (let i = 0; i < 150; i++) {
        simulateTime(16)
      }
    })

    // Should have alert for period transition
    const alertCalls = mockPlay.mock.calls.filter((call) => call[0] === 'alert')
    expect(alertCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('resets countdown beeps after entering overtime', async () => {
    // 2 seconds main time, 5 second periods
    const config = createByoyomiConfig(2, 3, 5)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    mockPlay.mockClear()

    // Run for ~7 seconds (2s main + 5s first period)
    await act(async () => {
      for (let i = 0; i < 450; i++) {
        simulateTime(16)
      }
    })

    // Should have tick sounds from main time countdown (2, 1)
    // AND from overtime countdown (5, 4, 3, 2, 1)
    const tickCalls = mockPlay.mock.calls.filter((call) => call[0] === 'tick')
    // At minimum: 2 from main time + 5 from overtime = 7
    expect(tickCalls.length).toBeGreaterThanOrEqual(7)
  })

  it('resets countdown beeps after period transition', async () => {
    // 0 main time, 3 periods of 3 seconds
    const config = createByoyomiConfig(0, 3, 3)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    mockPlay.mockClear()

    // Run for ~7 seconds (covers first period + part of second)
    await act(async () => {
      for (let i = 0; i < 450; i++) {
        simulateTime(16)
      }
    })

    // Should have ticks from first period (3, 2, 1) and second period (3, 2, 1)
    const tickCalls = mockPlay.mock.calls.filter((call) => call[0] === 'tick')
    // 3 from first period + at least 3 from second period
    expect(tickCalls.length).toBeGreaterThanOrEqual(6)
  })

  it('clears countdown alerts when switching turns', async () => {
    const config = createByoyomiConfig(10, 3, 30)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    mockPlay.mockClear()

    // Switch turn should clear alerts
    await act(async () => {
      await result.current.switchTurn()
    })

    // cancelScheduled should have been called
    expect(mockCancelScheduled).toHaveBeenCalled()
  })

  it('plays gong sound when time expires', async () => {
    // 1 period of 1 second, no main time
    const config = createByoyomiConfig(0, 1, 1)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    mockPlay.mockClear()

    // Run until game ends
    await act(async () => {
      for (let i = 0; i < 100; i++) {
        simulateTime(16)
      }
    })

    const gongCalls = mockPlay.mock.calls.filter((call) => call[0] === 'gong')
    expect(gongCalls.length).toBe(1)
    expect(result.current.gameState.status).toBe('ended')
  })
})

describe('useGameClock controls', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id)
    })
    let mockTime = 0
    vi.spyOn(performance, 'now').mockImplementation(() => {
      mockTime += 16
      return mockTime
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts game from waiting state', async () => {
    const config = createByoyomiConfig(60, 3, 30)
    const { result } = renderHook(() => useGameClock(config))

    expect(result.current.gameState.status).toBe('waiting')

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.gameState.status).toBe('running')
    expect(mockPlay).toHaveBeenCalledWith('click')
  })

  it('pauses and resumes game', async () => {
    const config = createByoyomiConfig(60, 3, 30)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    await act(async () => {
      result.current.pause()
    })

    expect(result.current.gameState.status).toBe('paused')
    expect(mockCancelScheduled).toHaveBeenCalled()

    await act(async () => {
      await result.current.resume()
    })

    expect(result.current.gameState.status).toBe('running')
  })

  it('resets game state', async () => {
    const config = createByoyomiConfig(60, 3, 30)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    // Run some time
    await act(async () => {
      for (let i = 0; i < 100; i++) {
        simulateTime(16)
      }
    })

    await act(async () => {
      result.current.reset()
    })

    expect(result.current.gameState.status).toBe('waiting')
    expect(result.current.gameState.black.mainTimeRemainingMs).toBe(60000)
    expect(result.current.gameState.white.mainTimeRemainingMs).toBe(60000)
  })

  it('switches turn and plays click sound', async () => {
    const config = createByoyomiConfig(60, 3, 30)
    const { result } = renderHook(() => useGameClock(config))

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.gameState.activePlayer).toBe('black')
    mockPlay.mockClear()

    await act(async () => {
      await result.current.switchTurn()
    })

    expect(result.current.gameState.activePlayer).toBe('white')
    expect(mockPlay).toHaveBeenCalledWith('click')
  })
})
