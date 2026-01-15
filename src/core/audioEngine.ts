import type { SoundProfile } from './gameState'

export type SoundId = 'click' | 'tick' | 'alert' | 'gong'

type SoundConfig = {
  volume: number
  enabled: boolean
}

type ProfileConfig = {
  [K in SoundId]: SoundConfig
}

const PROFILE_CONFIGS: Record<SoundProfile, ProfileConfig> = {
  silent: {
    click: { volume: 0, enabled: false },
    tick: { volume: 0, enabled: false },
    alert: { volume: 0, enabled: false },
    gong: { volume: 0, enabled: false },
  },
  subtle: {
    click: { volume: 0.3, enabled: true },
    tick: { volume: 0.2, enabled: true },
    alert: { volume: 0.4, enabled: true },
    gong: { volume: 0.5, enabled: true },
  },
  intense: {
    click: { volume: 0.6, enabled: true },
    tick: { volume: 0.5, enabled: true },
    alert: { volume: 0.8, enabled: true },
    gong: { volume: 1.0, enabled: true },
  },
}

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private buffers: Map<SoundId, AudioBuffer> = new Map()
  private profile: SoundProfile = 'subtle'
  private initialized = false
  private scheduledSources: AudioBufferSourceNode[] = []

  /**
   * Initialize the audio context. Must be called from a user gesture.
   */
  async init(): Promise<void> {
    if (this.initialized) return

    this.audioContext = new AudioContext()
    await this.generateTones()
    this.initialized = true
  }

  /**
   * Resume audio context if suspended (required after user gesture).
   */
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * Set the current sound profile.
   */
  setProfile(profile: SoundProfile): void {
    this.profile = profile
  }

  /**
   * Play a sound immediately.
   */
  play(soundId: SoundId): void {
    this.playAt(soundId, 0)
  }

  /**
   * Play a sound at a specific time offset from now (in seconds).
   */
  playAt(soundId: SoundId, delaySeconds: number): void {
    if (!this.audioContext || !this.initialized) return

    const config = PROFILE_CONFIGS[this.profile][soundId]
    if (!config.enabled || config.volume === 0) return

    const buffer = this.buffers.get(soundId)
    if (!buffer) return

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = buffer
    gainNode.gain.value = config.volume

    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    const startTime = this.audioContext.currentTime + delaySeconds
    source.start(startTime)

    // Track for cleanup
    this.scheduledSources.push(source)
    source.onended = () => {
      const index = this.scheduledSources.indexOf(source)
      if (index > -1) {
        this.scheduledSources.splice(index, 1)
      }
    }
  }

  /**
   * Schedule countdown beeps at 5, 4, 3, 2, 1 seconds.
   */
  scheduleCountdown(secondsRemaining: number): void {
    // Cancel any existing scheduled sounds
    this.cancelScheduled()

    // Schedule ticks for each second from secondsRemaining down to 1
    const countdownStart = Math.min(secondsRemaining, 5)
    for (let i = countdownStart; i >= 1; i--) {
      const delay = secondsRemaining - i
      if (delay >= 0) {
        this.playAt('tick', delay)
      }
    }
  }

  /**
   * Cancel all scheduled sounds.
   */
  cancelScheduled(): void {
    for (const source of this.scheduledSources) {
      try {
        source.stop()
      } catch {
        // Already stopped
      }
    }
    this.scheduledSources = []
  }

  /**
   * Generate synthetic tones as placeholders.
   * Replace with actual audio file loading for production.
   */
  private async generateTones(): Promise<void> {
    if (!this.audioContext) return

    // Click sound - short high beep
    this.buffers.set('click', this.createTone(800, 0.05, 'sine'))

    // Tick sound - medium beep
    this.buffers.set('tick', this.createTone(600, 0.1, 'sine'))

    // Alert sound - two-tone alert
    this.buffers.set('alert', this.createAlertTone())

    // Gong sound - low resonant tone
    this.buffers.set('gong', this.createGongTone())
  }

  /**
   * Create a simple tone.
   */
  private createTone(frequency: number, duration: number, type: OscillatorType): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')

    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let sample = 0

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
          break
        case 'triangle':
          sample = 2 * Math.abs(2 * ((frequency * t) % 1) - 1) - 1
          break
        default:
          sample = Math.sin(2 * Math.PI * frequency * t)
      }

      // Apply envelope (fade in/out)
      const envelope = Math.min(
        1,
        Math.min(i / (sampleRate * 0.01), (length - i) / (sampleRate * 0.01))
      )
      data[i] = sample * envelope * 0.5
    }

    return buffer
  }

  /**
   * Create a two-tone alert sound.
   */
  private createAlertTone(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')

    const sampleRate = this.audioContext.sampleRate
    const duration = 0.3
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // Alternate between two frequencies
      const freq = t < duration / 2 ? 880 : 660
      const sample = Math.sin(2 * Math.PI * freq * t)

      // Envelope
      const envelope = Math.min(
        1,
        Math.min(i / (sampleRate * 0.01), (length - i) / (sampleRate * 0.02))
      )
      data[i] = sample * envelope * 0.5
    }

    return buffer
  }

  /**
   * Create a gong-like sound.
   */
  private createGongTone(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')

    const sampleRate = this.audioContext.sampleRate
    const duration = 1.5
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    const baseFreq = 120

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // Combine multiple harmonics for richer sound
      let sample = 0
      sample += Math.sin(2 * Math.PI * baseFreq * t) * 1.0
      sample += Math.sin(2 * Math.PI * baseFreq * 2.4 * t) * 0.5
      sample += Math.sin(2 * Math.PI * baseFreq * 3.6 * t) * 0.25
      sample += Math.sin(2 * Math.PI * baseFreq * 5.1 * t) * 0.12

      // Exponential decay envelope
      const envelope = Math.exp(-t * 3)
      data[i] = sample * envelope * 0.3
    }

    return buffer
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.cancelScheduled()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.buffers.clear()
    this.initialized = false
  }
}

// Singleton instance
export const audioEngine = new AudioEngine()
