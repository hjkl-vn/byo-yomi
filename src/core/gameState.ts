// Time control types
export type TimeControlType = 'byoyomi' | 'canadian' | 'fischer'

export type ByoYomiConfig = {
  type: 'byoyomi'
  mainTimeSeconds: number
  periods: number
  periodTimeSeconds: number
}

export type CanadianConfig = {
  type: 'canadian'
  mainTimeSeconds: number
  stones: number
  overtimeSeconds: number
}

export type FischerConfig = {
  type: 'fischer'
  mainTimeSeconds: number
  incrementSeconds: number
}

export type TimeControlConfig = ByoYomiConfig | CanadianConfig | FischerConfig

// Sound profile
export type SoundProfile = 'silent' | 'subtle' | 'intense'

// Game configuration (what user sets up)
export type GameConfig = {
  timeControl: TimeControlConfig
  soundProfile: SoundProfile
}

// Player overtime state
export type ByoYomiOvertime = {
  type: 'byoyomi'
  periodsRemaining: number
  periodTimeRemainingMs: number
}

export type CanadianOvertime = {
  type: 'canadian'
  stonesRemaining: number
  overtimeRemainingMs: number
}

export type OvertimeState = ByoYomiOvertime | CanadianOvertime

// Player state during game
export type PlayerState = {
  mainTimeRemainingMs: number
  overtime: OvertimeState | null
  moves: number
  isInOvertime: boolean
}

// Overall game state
export type GameStatus = 'waiting' | 'running' | 'paused' | 'ended'
export type Player = 'black' | 'white'

export type GameState = {
  status: GameStatus
  activePlayer: Player
  black: PlayerState
  white: PlayerState
  winner: Player | null
}

// Create initial player state from config
export function createInitialPlayerState(config: TimeControlConfig): PlayerState {
  return {
    mainTimeRemainingMs: config.mainTimeSeconds * 1000,
    overtime: null,
    moves: 0,
    isInOvertime: false,
  }
}

// Create initial game state from config
export function createInitialGameState(config: GameConfig): GameState {
  return {
    status: 'waiting',
    activePlayer: 'black',
    black: createInitialPlayerState(config.timeControl),
    white: createInitialPlayerState(config.timeControl),
    winner: null,
  }
}
