// Game: the state machine and the loop. States: title, playing, paused, won,
// lost. It owns spawning, scoring, combos, waves and the win/lose rules, and
// hands all drawing to render.js.

import { CONFIG } from './config.js';
import { Input } from './input.js';
import { SoundEngine } from './audio.js';
import { Particles } from './particles.js';
import { Player, Ember, Wisp, PowerUp } from './entities.js';
import { circlesHit } from './collisions.js';
import { rand } from './random.js';
import {
  drawBackground,
  drawEmber,
  drawWisp,
  drawPowerUp,
  drawPlayer,
  drawHud,
  drawTitle,
  drawPaused,
  drawWin,
  drawLose,
} from './render.js';

const W = CONFIG.viewWidth;
const H = CONFIG.viewHeight;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sound = new SoundEngine();
    this.particles = new Particles();
    this.player = new Player();
    this.state = 'title';
    this.best = 0;
    try {
      this.best = Number(window.localStorage.getItem('emberlight-best') || 0) || 0;
    } catch {
      this.best = 0;
    }
    this.time = 0;
    this.lastTs = 0;
    this.resetRun();
  }

  resetRun() {
    this.player.reset();
    this.embers = [];
    this.wisps = [];
    this.powerUps = [];
    this.popups = [];
    this.score = 0;
    this.emberCount = 0;
    this.wave = 1;
    this.waveQuotaDone = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.comboTimer = 0;
    this.timeLeft = CONFIG.nightLengthSec;
    this.emberTimer = 0;
    this.wispTimer = 1.2;
    this.powerUpTimer = 8;
    this.banner = null;
    this.result = null;
    this.ambientTimer = 0;
    this.particles.clear();
    this.showBanner(`WAVE 1`, `Gather ${this.waveQuota()} embers`);
  }

  waveQuota() {
    return CONFIG.waves[this.wave - 1].quota;
  }

  waveEmberValue() {
    return CONFIG.waves[this.wave - 1].emberValue;
  }

  waveWispTarget() {
    return CONFIG.waves[this.wave - 1].wisps;
  }

  showBanner(text, sub) {
    this.banner = { text, sub, life: 2.2 };
  }

  start() {
    this.sound.unlock();
    this.sound.startMusic();
    this.resetRun();
    this.state = 'playing';
    this.input.consumePresses();
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.sound.stopMusic();
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.sound.startMusic();
    }
  }

  endRun(won, reason) {
    this.state = won ? 'won' : 'lost';
    this.banner = null;
    this.sound.stopMusic();
    const timeBonus = won ? Math.round(this.timeLeft) * CONFIG.score.timeBonusPerSec : 0;
    const heartBonus = won ? this.player.hearts * CONFIG.score.heartBonusOnWin : 0;
    this.score += timeBonus + heartBonus;
    this.result = {
      score: this.score,
      embers: this.emberCount,
      bestCombo: this.bestCombo,
      wave: this.wave,
      timeBonus,
      heartBonus,
      reason,
    };
    if (this.score > this.best) {
      this.best = this.score;
      try {
        window.localStorage.setItem('emberlight-best', String(this.best));
      } catch {
        // Best score is a nicety; never let storage break the game.
      }
    }
    if (won) this.sound.win();
    else this.sound.lose();
  }

  addPopup(x, y, text, color) {
    this.popups.push({ x, y, text, color, life: 0.9, maxLife: 0.9 });
  }

  collectEmber(ember) {
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.comboTimer = CONFIG.ember.comboWindowSec;
    const mult = Math.min(this.combo, CONFIG.ember.maxCombo);
    const gained = this.waveEmberValue() * mult;
    this.score += gained;
    this.emberCount += 1;
    this.waveQuotaDone += 1;
    this.particles.burst(ember.x, ember.y, '#ffd76a', 12, 160);
    this.addPopup(ember.x, ember.y - 18, `+${gained}`, '#ffe9a8');
    this.sound.pickup(this.combo);
    if (this.waveQuotaDone >= this.waveQuota()) this.clearWave();
  }

  clearWave() {
    this.score += CONFIG.score.waveClearBonus;
    this.sound.waveClear();
    this.particles.burst(this.player.x, this.player.y, '#ffd76a', 26, 260);
    if (this.wave >= CONFIG.waves.length) {
      this.endRun(true, 'quota');
      return;
    }
    this.wave += 1;
    this.waveQuotaDone = 0;
    this.showBanner(`WAVE ${this.wave}`, `Gather ${this.waveQuota()} embers`);
    // A breather: the field clears of wisps when a wave turns.
    this.wisps = [];
    this.wispTimer = 1.5;
  }

  hitByWisp(wisp) {
    const now = performance.now() / 1000;
    if (this.player.isInvulnerable) return;
    if (this.player.shield) {
      this.player.shield = false;
      this.player.invulnerableUntil = now + CONFIG.player.invulnerableSec;
      this.particles.burst(this.player.x, this.player.y, '#7dd3fc', 18, 220);
      this.addPopup(this.player.x, this.player.y - 26, 'SHIELD!', '#7dd3fc');
      this.sound.dash();
      return;
    }
    this.player.hearts -= 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.player.invulnerableUntil = now + CONFIG.player.invulnerableSec;
    this.particles.burst(this.player.x, this.player.y, '#ff6b81', 22, 240);
    this.addPopup(this.player.x, this.player.y - 26, 'OUCH!', '#ff8a7a');
    this.sound.hurt();
    // Knock the moth away from the wisp that caught it.
    const dx = this.player.x - wisp.x;
    const dy = this.player.y - wisp.y;
    const d = Math.hypot(dx, dy) || 1;
    this.player.vx = (dx / d) * 420;
    this.player.vy = (dy / d) * 420;
    if (this.player.hearts <= 0) this.endRun(false, 'hearts');
  }

  takePowerUp(powerUp) {
    const now = performance.now() / 1000;
    this.particles.burst(powerUp.x, powerUp.y, '#ffffff', 14, 180);
    this.sound.powerUp();
    if (powerUp.kind === 'shield') {
      this.player.shield = true;
      this.addPopup(this.player.x, this.player.y - 26, 'SHIELD BLOOM!', '#7dd3fc');
    } else if (powerUp.kind === 'magnet') {
      this.player.magnetUntil = now + CONFIG.powerUp.magnetDurationSec;
      this.addPopup(this.player.x, this.player.y - 26, 'MAGNET NECTAR!', '#f472b6');
    } else {
      for (const w of this.wisps) w.slowUntil = now + CONFIG.powerUp.slowDurationSec;
      this.addPopup(this.player.x, this.player.y - 26, 'SLOW DEW!', '#a3e635');
    }
  }

  spawnEmber() {
    if (this.embers.length >= CONFIG.ember.maxOnField) return;
    this.embers.push(new Ember());
  }

  spawnWisp() {
    if (this.wisps.length >= Math.min(this.waveWispTarget(), CONFIG.wisp.maxOnField)) return;
    this.wisps.push(new Wisp(this.wave));
  }

  update(dt) {
    this.time += dt;
    this.particles.update(dt);

    // Ambient fireflies drift across the title screen.
    if (this.state === 'title') {
      this.ambientTimer -= dt;
      if (this.ambientTimer <= 0) {
        this.ambientTimer = 0.25;
        this.particles.mote(rand(20, W - 20), rand(H - 140, H - 20), '#ffd76a');
      }
      return;
    }
    if (this.state !== 'playing') return;

    // The night clock only runs while playing.
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endRun(false, 'time');
      return;
    }

    const now = performance.now() / 1000;
    const move = this.input.moveVector();
    const mouseSteer = this.input.mouse.inside && this.input.mouse.down
      ? { x: this.input.mouse.x, y: this.input.mouse.y }
      : null;
    if (this.input.wantsDash() || this.input.mousePressed()) {
      if (this.player.startDash(now)) {
        this.sound.dash();
        this.particles.burst(this.player.x, this.player.y, '#ffe9a8', 8, 120);
      }
    }
    this.player.update(dt, move, mouseSteer);

    // Combo decay.
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Spawning.
    this.emberTimer -= dt;
    if (this.emberTimer <= 0) {
      this.emberTimer = CONFIG.ember.spawnIntervalSec;
      this.spawnEmber();
    }
    this.wispTimer -= dt;
    if (this.wispTimer <= 0) {
      this.wispTimer = CONFIG.wisp.spawnIntervalSec;
      this.spawnWisp();
    }
    this.powerUpTimer -= dt;
    if (this.powerUpTimer <= 0) {
      this.powerUpTimer = CONFIG.powerUp.spawnIntervalSec;
      this.powerUps.push(new PowerUp());
    }

    // Magnet pulls nearby embers toward the moth.
    if (this.player.hasMagnet) {
      for (const e of this.embers) {
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        const d = Math.hypot(dx, dy);
        if (d < CONFIG.powerUp.magnetRadius && d > 1) {
          e.x += (dx / d) * 320 * dt;
          e.y += (dy / d) * 320 * dt;
        }
      }
    }

    for (const e of this.embers) e.update(dt);
    for (const w of this.wisps) w.update(dt, this.player);
    for (const p of this.powerUps) p.update(dt);
    this.powerUps = this.powerUps.filter((p) => p.life > 0);

    // Collisions: embers, then wisps, then power-ups.
    for (let i = this.embers.length - 1; i >= 0; i -= 1) {
      if (circlesHit(this.player, this.embers[i])) {
        const ember = this.embers[i];
        this.embers.splice(i, 1);
        this.collectEmber(ember);
        if (this.state !== 'playing') return;
      }
    }
    for (const w of this.wisps) {
      if (circlesHit(this.player, w)) {
        this.hitByWisp(w);
        if (this.state !== 'playing') return;
      }
    }
    for (let i = this.powerUps.length - 1; i >= 0; i -= 1) {
      if (circlesHit(this.player, this.powerUps[i])) {
        const p = this.powerUps[i];
        this.powerUps.splice(i, 1);
        this.takePowerUp(p);
      }
    }

    // Score popups float up and fade.
    for (const pop of this.popups) {
      pop.life -= dt;
      pop.y -= 34 * dt;
    }
    this.popups = this.popups.filter((p) => p.life > 0);

    if (this.banner) {
      this.banner.life -= dt;
      if (this.banner.life <= 0) this.banner = null;
    }
  }

  handleKeys() {
    if (this.input.wasPressed('enter')) {
      if (this.state === 'title' || this.state === 'won' || this.state === 'lost') this.start();
    }
    if (this.input.wasPressed('r')) {
      if (this.state !== 'title') this.start();
    }
    if (this.input.wasPressed('p') || this.input.wasPressed('escape')) {
      this.togglePause();
    }
    if (this.input.wasPressed('m')) {
      this.sound.unlock();
      this.sound.toggleMute();
    }
    // Click (or tap) starts from any menu screen.
    if (this.input.mousePressed() && this.state !== 'playing' && this.state !== 'paused') {
      this.start();
    } else if (this.input.mousePressed() && this.state === 'paused') {
      this.togglePause();
    }
  }

  frame(ts) {
    const dt = Math.min(0.05, this.lastTs ? (ts - this.lastTs) / 1000 : 0.016);
    this.lastTs = ts;
    this.handleKeys();
    this.update(dt);
    this.draw();
    this.input.endFrame();
  }

  draw() {
    const ctx = this.ctx;
    drawBackground(ctx, this.time);
    if (this.state === 'title') {
      this.particles.draw(ctx);
      drawTitle(ctx, this.best);
      return;
    }
    for (const e of this.embers) drawEmber(ctx, e);
    for (const p of this.powerUps) drawPowerUp(ctx, p);
    for (const w of this.wisps) drawWisp(ctx, w, this.time);
    drawPlayer(ctx, this.player, this.time);
    this.particles.draw(ctx);
    drawHud(ctx, {
      score: this.score,
      combo: this.combo,
      hearts: Math.max(0, this.player.hearts),
      maxHearts: CONFIG.player.startHearts,
      wave: this.wave,
      totalWaves: CONFIG.waves.length,
      quotaDone: this.waveQuotaDone,
      quota: this.waveQuota(),
      timeLeft: this.timeLeft,
      dashCooldown: this.player.dashCooldownLeft,
      popups: this.popups,
      banner: this.state === 'playing' ? this.banner : null,
    });
    if (this.state === 'paused') drawPaused(ctx);
    else if (this.state === 'won' && this.result) drawWin(ctx, this.result);
    else if (this.state === 'lost' && this.result) drawLose(ctx, this.result);
  }

  run() {
    const loop = (ts) => {
      this.frame(ts);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
