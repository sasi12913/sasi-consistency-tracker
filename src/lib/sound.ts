// Web Audio API Synthesizer for Focus Mode Ambient Sounds (GOAT Edition)
// Synthesizes sounds in real time to avoid loading large audio files.

export class AmbienceEngine {
  private ctx: AudioContext | null = null;
  
  // Audio nodes for Rain
  private rainNode: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;

  // Audio nodes for Wind
  private windNode: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private windLfoGain: GainNode | null = null;

  // Audio nodes for Brook (Water)
  private brookNode: AudioBufferSourceNode | null = null;
  private brookGain: GainNode | null = null;
  private brookFilter: BiquadFilterNode | null = null;
  private brookModulator: OscillatorNode | null = null;
  private brookModulatorGain: GainNode | null = null;

  // Global Master volume
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.5;

  constructor() {
    // Audio Context is initialized lazily upon user interaction (browser restriction)
  }

  private initContext() {
    if (this.ctx) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.currentVolume;
    this.masterGain.connect(this.ctx.destination);
  }

  // Helper to generate white noise buffer
  private createWhiteNoiseBuffer(seconds: number = 2): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Helper to generate pink noise buffer (Kellet refinement)
  private createPinkNoiseBuffer(seconds: number = 2): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // rescue gain
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public setMasterVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  // --- RAIN SOUND ---
  public startRain() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.rainNode) return; // already playing

    try {
      const buffer = this.createPinkNoiseBuffer(3);
      this.rainNode = this.ctx.createBufferSource();
      this.rainNode.buffer = buffer;
      this.rainNode.loop = true;

      this.rainFilter = this.ctx.createBiquadFilter();
      this.rainFilter.type = 'lowpass';
      this.rainFilter.frequency.value = 1600; // soft rain cutoff

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.value = 0.35; // base rain mix volume

      // Connect: Source -> Filter -> Gain -> Master
      this.rainNode.connect(this.rainFilter);
      this.rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);

      this.rainNode.start(0);
    } catch (e) {
      console.error('Failed to start rain synthesis', e);
    }
  }

  public stopRain() {
    if (this.rainNode) {
      try {
        this.rainNode.stop();
        this.rainNode.disconnect();
      } catch (e) {}
      this.rainNode = null;
    }
    if (this.rainFilter) {
      this.rainFilter.disconnect();
      this.rainFilter = null;
    }
    if (this.rainGain) {
      this.rainGain.disconnect();
      this.rainGain = null;
    }
  }

  // --- FOREST WIND SOUND ---
  public startWind() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.windNode) return;

    try {
      const buffer = this.createWhiteNoiseBuffer(4);
      this.windNode = this.ctx.createBufferSource();
      this.windNode.buffer = buffer;
      this.windNode.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.Q.value = 3.0; // resonant wind focus
      this.windFilter.frequency.value = 400; // starting center freq

      // LFO to slowly sweep the wind frequency (simulating blowing wind)
      this.windLfo = this.ctx.createOscillator();
      this.windLfo.type = 'sine';
      this.windLfo.frequency.value = 0.08; // very slow: 12 seconds per cycle

      this.windLfoGain = this.ctx.createGain();
      this.windLfoGain.gain.value = 250; // sweep range: 400Hz +/- 250Hz

      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0.15; // wind mix volume

      // LFO connection to filter frequency
      this.windLfo.connect(this.windLfoGain);
      if (this.windLfoGain) {
        this.windLfoGain.connect(this.windFilter.frequency);
      }

      // Main audio chain
      this.windNode.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.masterGain);

      this.windLfo.start(0);
      this.windNode.start(0);
    } catch (e) {
      console.error('Failed to start wind synthesis', e);
    }
  }

  public stopWind() {
    if (this.windNode) {
      try {
        this.windNode.stop();
        this.windNode.disconnect();
      } catch (e) {}
      this.windNode = null;
    }
    if (this.windLfo) {
      try {
        this.windLfo.stop();
        this.windLfo.disconnect();
      } catch (e) {}
      this.windLfo = null;
    }
    if (this.windLfoGain) {
      this.windLfoGain.disconnect();
      this.windLfoGain = null;
    }
    if (this.windFilter) {
      this.windFilter.disconnect();
      this.windFilter = null;
    }
    if (this.windGain) {
      this.windGain.disconnect();
      this.windGain = null;
    }
  }

  // --- NATURE BROOK SOUND ---
  public startBrook() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.brookNode) return;

    try {
      const buffer = this.createWhiteNoiseBuffer(2);
      this.brookNode = this.ctx.createBufferSource();
      this.brookNode.buffer = buffer;
      this.brookNode.loop = true;

      this.brookFilter = this.ctx.createBiquadFilter();
      this.brookFilter.type = 'bandpass';
      this.brookFilter.Q.value = 15; // high Q for babbling tone
      this.brookFilter.frequency.value = 950; // water peak frequency

      // Modulator to generate ripples (faster LFO modulating volume)
      this.brookModulator = this.ctx.createOscillator();
      this.brookModulator.type = 'sine';
      this.brookModulator.frequency.value = 8.5; // 8.5Hz water bubbling frequency

      this.brookModulatorGain = this.ctx.createGain();
      this.brookModulatorGain.gain.value = 0.05; // gentle modulation

      this.brookGain = this.ctx.createGain();
      this.brookGain.gain.value = 0.08; // starting volume

      // Modulate the brook volume
      this.brookModulator.connect(this.brookModulatorGain);
      if (this.brookModulatorGain) {
        this.brookModulatorGain.connect(this.brookGain.gain);
      }

      // Audio path
      this.brookNode.connect(this.brookFilter);
      this.brookFilter.connect(this.brookGain);
      this.brookGain.connect(this.masterGain);

      this.brookModulator.start(0);
      this.brookNode.start(0);
    } catch (e) {
      console.error('Failed to start brook synthesis', e);
    }
  }

  public stopBrook() {
    if (this.brookNode) {
      try {
        this.brookNode.stop();
        this.brookNode.disconnect();
      } catch (e) {}
      this.brookNode = null;
    }
    if (this.brookModulator) {
      try {
        this.brookModulator.stop();
        this.brookModulator.disconnect();
      } catch (e) {}
      this.brookModulator = null;
    }
    if (this.brookModulatorGain) {
      this.brookModulatorGain.disconnect();
      this.brookModulatorGain = null;
    }
    if (this.brookFilter) {
      this.brookFilter.disconnect();
      this.brookFilter = null;
    }
    if (this.brookGain) {
      this.brookGain.disconnect();
      this.brookGain = null;
    }
  }

  // --- UTILITY: STOP ALL ---
  public stopAll() {
    this.stopRain();
    this.stopWind();
    this.stopBrook();
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- AUDIO SFX SYNTHESIZERS (MOTIVATION CHIMES) ---
  public playSuccessChime() {
    this.initContext();
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;
    
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now); // G5 note
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // Sweep to D6 for bright click feel
      
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02); // quick attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // decay
      
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {
      console.error('Failed to synthesize chime', e);
    }
  }

  public playCelebrationArpeggio() {
    this.initContext();
    this.resumeContext();
    const ctx = this.ctx;
    const masterGain = this.masterGain;
    if (!ctx || !masterGain) return;
    
    try {
      const now = ctx.currentTime;
      // Rising major arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, idx) => {
        const noteTime = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'triangle'; // softer, warm organic tone
        osc.frequency.setValueAtTime(freq, noteTime);
        
        gain.gain.setValueAtTime(0.01, noteTime);
        gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
        
        osc.start(noteTime);
        osc.stop(noteTime + 0.38);
      });
    } catch (e) {
      console.error('Failed to synthesize arpeggio', e);
    }
  }
}

// Export a singleton instance (or create it locally in Focus component)
// In a Next.js environment, the window object is not available on Server side.
// We must make sure it is instantiated only on client side.
let engineInstance: AmbienceEngine | null = null;

export function getAmbienceEngine(): AmbienceEngine {
  if (typeof window === 'undefined') {
    return new Proxy({}, {
      get() { return () => {}; }
    }) as any;
  }
  if (!engineInstance) {
    engineInstance = new AmbienceEngine();
  }
  return engineInstance;
}
