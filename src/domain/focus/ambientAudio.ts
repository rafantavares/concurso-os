'use client';

import { AmbientSoundType } from './types';

class AmbientAudioManager {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'OFF';
  private gainNode: GainNode | null = null;
  private sourceNodes: (AudioNode | AudioBufferSourceNode)[] = [];
  private isMuted: boolean = false;
  private currentVolume: number = 0.5;

  private initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(this.currentVolume);
  }

  public stopAmbient() {
    for (const node of this.sourceNodes) {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped nodes
      }
    }
    this.sourceNodes = [];
    this.currentType = 'OFF';
  }

  public startAmbient(type: AmbientSoundType, volume: number = 0.5) {
    this.stopAmbient();
    if (type === 'OFF') return;

    const ctx = this.initContext();
    if (!ctx) return;

    this.currentType = type;
    this.currentVolume = volume;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.gainNode = masterGain;

    if (type === 'BROWN_NOISE') {
      this.playBrownNoise(ctx, masterGain);
    } else if (type === 'RAIN') {
      this.playRain(ctx, masterGain);
    } else if (type === 'ALPHA_WAVES') {
      this.playAlphaWaves(ctx, masterGain);
    }
  }

  private playBrownNoise(ctx: AudioContext, destination: GainNode) {
    // 5 seconds looping brownian noise buffer
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      outputValue: {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Low-pass filter to make it mellow and warm
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start(0);

    this.sourceNodes.push(source, filter);
  }

  private playRain(ctx: AudioContext, destination: GainNode) {
    // Rain texture: Pink/Brown noise with bandpass filtering and slight random amplitude
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
      left[i] = pink;
      right[i] = pink * (0.8 + Math.random() * 0.4);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start(0);

    this.sourceNodes.push(source, filter);
  }

  private playAlphaWaves(ctx: AudioContext, destination: GainNode) {
    // Binaural / gentle sine wave pulse (432Hz base with 10Hz alpha beat difference)
    const baseFreq = 216;
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq + 10, ctx.currentTime); // 10Hz Alpha beat

    const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    if (panner1 && panner2) {
      panner1.pan.setValueAtTime(-0.8, ctx.currentTime);
      panner2.pan.setValueAtTime(0.8, ctx.currentTime);

      osc1.connect(panner1);
      osc2.connect(panner2);
      panner1.connect(destination);
      panner2.connect(destination);
      this.sourceNodes.push(osc1, osc2, panner1, panner2);
    } else {
      osc1.connect(destination);
      osc2.connect(destination);
      this.sourceNodes.push(osc1, osc2);
    }

    osc1.start();
    osc2.start();
  }

  public playChime(isTransitionToBreak: boolean = true) {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      // Pleasant Tibetan singing bowl / soft harmonic chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Foco terminando: tom solene descendente ou sino suave (528Hz Love/DNA frequency)
      // Pausa terminando: tom energizante (660Hz)
      const freq = isTransitionToBreak ? 528 : 660;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.5);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }
}

export const ambientAudio = new AmbientAudioManager();
