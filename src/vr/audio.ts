/**
 * Web Audio API Procedural Synthesizer for Kolkata 2050
 * Generates all soundscapes without external audio files.
 */

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  // Sound nodes
  private cityAmbienceGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private trafficGain: GainNode | null = null;
  private energyGain: GainNode | null = null;

  // Interval handles
  private thunderTimer: number | null = null;
  private metroTimer: number | null = null;

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupAmbience();
      this.setupRain();
      this.setupWind();
      this.setupTraffic();
      this.setupEnergyGrid();

      this.isInitialized = true;

      // Start background metro sounds periodically
      this.schedulePeriodicMetro();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  private createNoiseBuffer(duration = 3): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    // Pink-ish noise
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost
    }
    return buffer;
  }

  private setupAmbience() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(4);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);

    this.cityAmbienceGain = this.ctx.createGain();
    this.cityAmbienceGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.cityAmbienceGain);
    this.cityAmbienceGain.connect(this.masterGain);
    noise.start();
  }

  private setupRain() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(2);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    noise.start();
  }

  private setupWind() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(4);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    noise.start();
  }

  private setupTraffic() {
    if (!this.ctx || !this.masterGain) return;
    // Sub-bass motor hum for autonomous electric vehicles
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.trafficGain = this.ctx.createGain();
    this.trafficGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(this.trafficGain);
    this.trafficGain.connect(this.masterGain);
    osc.start();
  }

  private setupEnergyGrid() {
    if (!this.ctx || !this.masterGain) return;
    // High-tech harmonic shimmer for renewable energy district
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(432, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(864, this.ctx.currentTime);

    this.energyGain = this.ctx.createGain();
    this.energyGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    osc1.connect(this.energyGain);
    osc2.connect(this.energyGain);
    this.energyGain.connect(this.masterGain);
    osc1.start();
    osc2.start();
  }

  public setWeatherMode(mode: 'clear' | 'storm' | 'heatwave' | 'smog' | 'night' | 'sunset') {
    if (!this.ctx || !this.rainGain || !this.windGain) return;
    const now = this.ctx.currentTime;

    if (mode === 'storm') {
      this.rainGain.gain.linearRampToValueAtTime(0.35, now + 1.5);
      this.windGain.gain.linearRampToValueAtTime(0.18, now + 1.5);
      this.startThunderStorm();
    } else {
      this.rainGain.gain.linearRampToValueAtTime(0.0, now + 1.0);
      this.stopThunderStorm();
      if (mode === 'heatwave') {
        this.windGain.gain.linearRampToValueAtTime(0.08, now + 1.0);
      } else {
        this.windGain.gain.linearRampToValueAtTime(0.03, now + 1.0);
      }
    }
  }

  private startThunderStorm() {
    this.stopThunderStorm();
    const trigger = () => {
      this.playThunder();
      const nextTime = 5000 + Math.random() * 8000;
      this.thunderTimer = window.setTimeout(trigger, nextTime);
    };
    this.thunderTimer = window.setTimeout(trigger, 1200);
  }

  private stopThunderStorm() {
    if (this.thunderTimer) {
      clearTimeout(this.thunderTimer);
      this.thunderTimer = null;
    }
  }

  public playThunder() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Deep low frequency rumble
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 2.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.6);
  }

  public playHologramOpen() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playTeleportSound() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playButtonClick() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1174.66, now + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playMetroSwoosh() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(220, now + 1.2);
    osc.frequency.linearRampToValueAtTime(90, now + 2.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.6);
  }

  private schedulePeriodicMetro() {
    const run = () => {
      if (!this.isMuted && Math.random() > 0.3) {
        this.playMetroSwoosh();
      }
      this.metroTimer = window.setTimeout(run, 12000 + Math.random() * 10000);
    };
    this.metroTimer = window.setTimeout(run, 6000);
  }

  public toggleMute(): boolean {
    if (!this.masterGain || !this.ctx) {
      this.init();
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.35,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  public unmute() {
    if (!this.masterGain || !this.ctx) {
      this.init();
    }
    this.isMuted = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const audioEngine = new ProceduralAudioEngine();
