// SoundEngine: every sound in Emberlight is synthesized live with WebAudio —
// no audio files are shipped. It starts on the first user gesture (browsers
// block audio before one) and stays silent if audio is unavailable.

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.muted = false;
  }

  // Call from any user gesture (start, key press, click).
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  // One short oscillator blip with a pitch glide and a quick fade.
  blip(freqFrom, freqTo, durationSec, type, volume) {
    if (!this.ctx || this.muted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqFrom, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqTo), t + durationSec);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);
      osc.connect(gain).connect(this.master);
      osc.start(t);
      osc.stop(t + durationSec + 0.02);
    } catch {
      // Audio is decoration; a failure here must never break the game.
    }
  }

  pickup(combo) {
    // The pickup note climbs with the combo, so a chain sounds rewarding.
    const base = 520 * Math.pow(1.059, Math.min(combo, 8));
    this.blip(base, base * 1.5, 0.12, 'sine', 0.22);
    this.blip(base * 2, base * 2.4, 0.09, 'triangle', 0.08);
  }

  dash() {
    this.blip(300, 900, 0.14, 'sawtooth', 0.07);
  }

  hurt() {
    this.blip(220, 55, 0.3, 'square', 0.16);
  }

  powerUp() {
    this.blip(660, 660, 0.08, 'sine', 0.18);
    setTimeout(() => this.blip(880, 880, 0.08, 'sine', 0.18), 70);
    setTimeout(() => this.blip(1320, 1320, 0.14, 'sine', 0.16), 140);
  }

  waveClear() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.blip(f, f, 0.22, 'triangle', 0.16), i * 90);
    });
  }

  win() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
      setTimeout(() => this.blip(f, f, 0.3, 'triangle', 0.16), i * 110);
    });
  }

  lose() {
    [392, 330, 262, 196].forEach((f, i) => {
      setTimeout(() => this.blip(f, f * 0.94, 0.32, 'sine', 0.15), i * 150);
    });
  }

  // A slow, quiet two-note pad that loops while the game runs.
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const notes = [220, 277, 330, 262];
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const f = notes[this.musicStep % notes.length];
      this.musicStep += 1;
      this.blip(f, f, 1.6, 'sine', 0.045);
      this.blip(f * 1.5, f * 1.5, 1.6, 'sine', 0.02);
    }, 900);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
