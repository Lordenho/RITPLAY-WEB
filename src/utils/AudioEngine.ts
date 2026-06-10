/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioEngine {
  private static instance: AudioEngine | null = null;
  private audioCtx: AudioContext | null = null;

  // Scheduler variables
  private isRunning: boolean = false;
  private bpm: number = 120;
  private nextNoteTime: number = 0.0; // When the next note is due
  private currentStep: number = 0; // Steps 0 - 15 (16th notes) or 0 - 3 (quarter notes)
  private lookahead: number = 25.0; // How frequently to call scheduling function (ms)
  private scheduleAheadTime: number = 0.1; // How far ahead to schedule audio (sec)
  private timerId: number | null = null;

  // Callbacks
  private onStepCallback: ((step: number, stepTime: number) => void) | null = null;

  // Track expected beat times for the timing comparison
  private expectedBeatTimes: { time: number; step: number }[] = [];

  private activeCadenceGrid: boolean[][] | null = null;
  private activeHitSoundType: 'Bongo 1' | 'Bongo 2' = 'Bongo 1';
  private metronomeOnly: boolean = false;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initializes or unlocks the AudioContext (must be called inside a user interaction like a click).
   */
  public async init(): Promise<void> {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public getContext(): AudioContext | null {
    return this.audioCtx;
  }

  /**
   * Synthesizes percussive hit sounds perfectly
   */
  public playHit(type: 'Classic' | 'Bongo 1' | 'Bongo 2', time: number = 0): void {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const playTime = time || ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'Classic') {
      // Crisp synthetic clock woodblock
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, playTime);
      osc.frequency.exponentialRampToValueAtTime(100, playTime + 0.04);

      gainNode.gain.setValueAtTime(0.5, playTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.04);
      osc.start(playTime);
      osc.stop(playTime + 0.05);
    } else if (type === 'Bongo 1') {
      // Dynamic high-pitched bongo hit
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, playTime);
      osc.frequency.exponentialRampToValueAtTime(180, playTime + 0.08);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, playTime);
      filter.Q.setValueAtTime(3.0, playTime);

      gainNode.gain.setValueAtTime(0.8, playTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.1);
      osc.start(playTime);
      osc.stop(playTime + 0.12);
    } else if (type === 'Bongo 2') {
      // Deeper, warmer low-pitched bongo
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, playTime);
      osc.frequency.exponentialRampToValueAtTime(120, playTime + 0.15);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(260, playTime);
      filter.Q.setValueAtTime(2.0, playTime);

      gainNode.gain.setValueAtTime(0.9, playTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.18);
      osc.start(playTime);
      osc.stop(playTime + 0.2);
    }
  }

  /**
   * Internal scheduler loop using high-precision timers
   */
  private scheduler(): void {
    if (!this.audioCtx) return;
    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceNote();
    }
    this.timerId = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private advanceNote(): void {
    if (!this.audioCtx) return;
    const secondsPerBeat = 60.0 / this.bpm;
    
    if (this.metronomeOnly) {
      // 4 beats structure for basic metronome/exercises
      this.nextNoteTime += secondsPerBeat;
      this.currentStep = (this.currentStep + 1) % 4;
    } else {
      // 16th note steps for cadence loop composition
      const secondsPerStep = 0.25 * secondsPerBeat; // 16th notes
      this.nextNoteTime += secondsPerStep;
      this.currentStep = (this.currentStep + 1) % 16;
    }
  }

  private scheduleNote(step: number, time: number): void {
    // Record expected beat times to compare user taps
    this.expectedBeatTimes.push({ time, step });
    // Keep it trimmed
    if (this.expectedBeatTimes.length > 50) {
      this.expectedBeatTimes.shift();
    }

    if (this.metronomeOnly) {
      // Standard click (classical metronome sound)
      this.playHit('Classic', time);
      if (this.onStepCallback) {
        // Run visual trigger safely in secondary animation frame or microtask
        setTimeout(() => this.onStepCallback?.(step, time), 0);
      }
    } else if (this.activeCadenceGrid) {
      // Play compose items in cadence creation grid
      // Row 0: Bongo 1, Row 1: Bongo 2
      const playB1 = this.activeCadenceGrid[0] ? this.activeCadenceGrid[0][step] : false;
      const playB2 = this.activeCadenceGrid[1] ? this.activeCadenceGrid[1][step] : false;

      if (playB1) {
        this.playHit('Bongo 1', time);
      }
      if (playB2) {
        this.playHit('Bongo 2', time);
      }

      if (this.onStepCallback) {
        setTimeout(() => this.onStepCallback?.(step, time), 0);
      }
    }
  }

  /**
   * Starts a classic metronome (mainly for active rhythms and training/challenges)
   */
  public startMetronome(bpm: number, onBeat: (step: number, time: number) => void): void {
    this.init().then(() => {
      if (this.isRunning) this.stop();
      if (!this.audioCtx) return;

      this.isRunning = true;
      this.bpm = bpm;
      this.metronomeOnly = true;
      this.activeCadenceGrid = null;
      this.currentStep = 0;
      this.onStepCallback = onBeat;

      // Scheds start immediately
      this.nextNoteTime = this.audioCtx.currentTime + 0.05;
      this.expectedBeatTimes = [];
      this.scheduler();
    });
  }

  /**
   * Play cadence compose grids in loops
   */
  public startCadenceLoop(
    bpm: number,
    grid: boolean[][],
    hitSoundType: 'Bongo 1' | 'Bongo 2',
    onStep: (stepIndex: number, stepTime: number) => void
  ): void {
    this.init().then(() => {
      if (this.isRunning) this.stop();
      if (!this.audioCtx) return;

      this.isRunning = true;
      this.bpm = bpm;
      this.metronomeOnly = false;
      this.activeCadenceGrid = grid;
      this.activeHitSoundType = hitSoundType;
      this.currentStep = 0;
      this.onStepCallback = onStep;

      this.nextNoteTime = this.audioCtx.currentTime + 0.05;
      this.expectedBeatTimes = [];
      this.scheduler();
    });
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.expectedBeatTimes = [];
  }

  /**
   * Evaluates tap timing compared to expected beat timing
   * Returns details about accuracy, latency (ms), and category
   */
  public evaluateTap(): {
    deltaMs: number;
    category: 'Perfeito' | 'Adiantado' | 'Atrasado' | 'Longe' | 'Errou';
    percentage: number;
  } {
    if (!this.audioCtx || !this.isRunning) {
      return { deltaMs: 0, category: 'Errou', percentage: 0 };
    }

    const tapTime = this.audioCtx.currentTime;
    
    if (this.expectedBeatTimes.length === 0) {
      return { deltaMs: 0, category: 'Errou', percentage: 0 };
    }

    // Find the closest expected beat time in the timeline
    let closestBeat = this.expectedBeatTimes[0];
    let minDelta = Math.abs(tapTime - closestBeat.time);

    for (let i = 1; i < this.expectedBeatTimes.length; i++) {
      const delta = Math.abs(tapTime - this.expectedBeatTimes[i].time);
      if (delta < minDelta) {
        minDelta = delta;
        closestBeat = this.expectedBeatTimes[i];
      }
    }

    const deltaSec = tapTime - closestBeat.time; // Negative for early, positive for late
    const deltaMs = Math.round(deltaSec * 1000);

    const absDelta = Math.abs(deltaMs);

    let category: 'Perfeito' | 'Adiantado' | 'Atrasado' | 'Longe' | 'Errou';
    let percentage = 0;

    if (absDelta <= 25) {
      category = 'Perfeito';
      percentage = 100 - (absDelta * 2); // 95 - 100%
    } else if (absDelta <= 85) {
      category = deltaMs < 0 ? 'Adiantado' : 'Atrasado';
      percentage = Math.max(50, Math.round(95 - ((absDelta - 25) * 0.75)));
    } else if (absDelta <= 180) {
      category = 'Longe';
      percentage = Math.max(10, Math.round(50 - ((absDelta - 85) * 0.4)));
    } else {
      category = 'Errou';
      percentage = 0;
    }

    return { deltaMs, category, percentage };
  }
}
