import { SchedulerState } from '../types';

type BeatCallback = (state: SchedulerState) => void;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private bpm: number = 90;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Game Logic State inside Audio Engine to ensure sync
  private beatIndex: number = 0;
  private currentRound: number = 1;
  private currentLoop: number = 1;
  private isIntermission: boolean = false;
  private intermissionCounter: number = 0;
  private isLoopTransition: boolean = false;
  private loopTransitionCounter: number = 0;
  private loopsPerRound: number = 2;
  private totalRounds: number = 5;
  private itemsInGrid: number = 8;
  
  private onBeat: BeatCallback | null = null;
  private onRoundChange: ((round: number) => void) | null = null;
  private onStop: (() => void) | null = null;

  constructor() {
    // Lazy init in start()
  }

  public setCallbacks(
    onBeat: BeatCallback, 
    onRoundChange: (round: number) => void,
    onStop: () => void
  ) {
    this.onBeat = onBeat;
    this.onRoundChange = onRoundChange;
    this.onStop = onStop;
  }

  public setBpm(bpm: number) {
    this.bpm = bpm;
  }

  public setItemsInGrid(count: number) {
    this.itemsInGrid = count;
  }

  public setTotalRounds(count: number) {
    this.totalRounds = count;
  }

  public start() {
    if (this.isPlaying) return;

    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.currentRound = 1;
    this.currentLoop = 1;
    this.beatIndex = 0;
    this.isIntermission = false;
    this.intermissionCounter = 0;
    this.isLoopTransition = false;
    this.loopTransitionCounter = 0;
    
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      clearTimeout(this.timerID);
    }
    if (this.onStop) this.onStop();
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  private scheduler() {
    if (!this.ctx) return;
    
    // Schedule ahead 0.1s
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.scheduleNote(this.nextNoteTime);
      this.advanceNote();
      if (!this.isPlaying) break; 
    }
    
    if (this.isPlaying) {
      this.timerID = window.setTimeout(() => this.scheduler(), 25);
    }
  }

  private scheduleNote(time: number) {
    if (!this.ctx) return;

    // Trigger UI Callback strictly synchronized with audio time
    // We use a small setTimeout based on difference to currentTime to fire React state update
    const timeUntilNote = (time - this.ctx.currentTime) * 1000;
    
    // Capture state for the closure
    const stateSnapshot: SchedulerState = {
        currentRound: this.currentRound,
        currentLoop: this.currentLoop,
        beatIndex: this.beatIndex,
        isIntermission: this.isIntermission,
        isLoopTransition: this.isLoopTransition
    };

    setTimeout(() => {
        if (this.isPlaying && this.onBeat) {
            this.onBeat(stateSnapshot);
        }
    }, Math.max(0, timeUntilNote));

    // Audio Synthesis
    if (this.isIntermission) {
        this.playStick(time);
        return;
    }

    if (this.isLoopTransition) {
        // Fill pattern
        if (this.loopTransitionCounter === 3) this.playStick(time, true);
        else {
            if (this.loopTransitionCounter % 2 === 0) this.playHiHat(time);
            else this.playSnare(time);
        }
        return;
    }

    if (this.currentRound > this.totalRounds) {
        // Finished state music or silence?
        // Let's just play hihats
        this.playHiHat(time);
        return;
    }

    // Standard Beat
    const bassFreq = this.currentLoop === 1 ? 130.81 : 196.00;
    this.playKick(time);
    this.playHiHat(time);
    this.playBass(time, bassFreq);
    if (this.beatIndex % 2 !== 0) this.playSnare(time);
  }

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += secondsPerBeat;

    if (this.currentRound > this.totalRounds) {
        // Just keep playing beat until user stops or we auto-stop
        // Let's auto stop after 2 bars of completion
        if (this.beatIndex > 8) {
             this.stop();
        }
        this.beatIndex++;
        return;
    }

    if (this.isIntermission) {
        this.intermissionCounter++;
        if (this.intermissionCounter >= 4) {
            this.isIntermission = false;
            this.intermissionCounter = 0;
            this.currentRound++;
            this.currentLoop = 1;
            this.beatIndex = 0;
            // Notify round change to generate new grid
            if (this.onRoundChange) this.onRoundChange(this.currentRound);
        }
        return;
    }

    if (this.isLoopTransition) {
        this.loopTransitionCounter++;
        if (this.loopTransitionCounter >= 4) {
            this.isLoopTransition = false;
            this.loopTransitionCounter = 0;
            this.currentLoop++;
            this.beatIndex = 0;
        }
        return;
    }

    this.beatIndex++;
    if (this.beatIndex >= this.itemsInGrid) {
        this.beatIndex = 0;
        if (this.currentLoop < this.loopsPerRound) {
            this.isLoopTransition = true;
            this.loopTransitionCounter = 0;
        } else {
            // End of round
            if (this.currentRound < this.totalRounds) {
                this.isIntermission = true;
                this.intermissionCounter = 0;
            } else {
                this.currentRound++; // Triggers finish state
            }
        }
    }
  }

  // --- SYNTH INSTRUMENTS ---

  private playKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    osc.start(time);
    osc.stop(time + 0.5);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = this.ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    noise.start(time);
    noise.stop(time + 0.2);
  }

  private playHiHat(time: number) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    const gain = this.ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    noise.start(time);
    noise.stop(time + 0.05);
  }

  private playBass(time: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playStick(time: number, highPitch: boolean = false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(highPitch ? 1200 : 800, time);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.05);
  }
}