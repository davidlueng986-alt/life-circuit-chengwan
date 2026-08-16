/** Generated rain bed + tool ticks. No downloaded VO, no telemetry. */

export class RainBed {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;

  start(): void {
    if (this.ctx) return;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0.045;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    this.ctx = ctx;
    this.gain = gain;
  }

  setMuted(muted: boolean): void {
    if (this.gain) this.gain.gain.value = muted ? 0 : 0.045;
  }

  stop(): void {
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.gain = null;
    }
  }
}

/** Short procedural ticks for tools. Never VO, never telemetry. */
export class ToolVoice {
  private ctx: AudioContext | null = null;
  muted = false;

  ensure(): AudioContext | null {
    if (this.muted) return this.ctx;
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();
    return this.ctx;
  }

  pulse(): void {
    this.blip(420, 0.09, 0.035, "bandpass");
  }

  empty(): void {
    this.blip(90, 0.06, 0.05, "lowpass");
  }

  snap(): void {
    this.blip(180, 0.07, 0.045, "lowpass");
  }

  lock(): void {
    this.blip(70, 0.08, 0.03, "lowpass");
  }

  chirp(): void {
    this.blip(880, 0.05, 0.028, "highpass");
  }

  layer(index: number): void {
    this.blip(140 + index * 50, 0.12, 0.04, "lowpass");
  }

  private blip(freq: number, seconds: number, gain: number, kind: BiquadFilterType): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    filter.type = kind;
    filter.frequency.value = freq * 1.4;
    amp.gain.value = gain;
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  }
}
