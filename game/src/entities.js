// Entities: the things that live on the field — the moth, the embers it
// harvests, the wisps that hunt it, and the rare blooms that help it. Each
// class owns its own update; the Game decides when they spawn and collide.

import { CONFIG } from './config.js';
import { rand, pick, clamp, angleTo } from './random.js';

const W = CONFIG.viewWidth;
const H = CONFIG.viewHeight;

export class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = W / 2;
    this.y = H - 90;
    this.vx = 0;
    this.vy = 0;
    this.radius = CONFIG.player.radius;
    this.angle = -Math.PI / 2;
    this.wingPhase = 0;
    this.hearts = CONFIG.player.startHearts;
    this.invulnerableUntil = 0;
    this.dashUntil = 0;
    this.dashReadyAt = 0;
    this.shield = false;
    this.magnetUntil = 0;
    this.trail = [];
  }

  get dashCooldownLeft() {
    return Math.max(0, this.dashReadyAt - performance.now() / 1000);
  }

  get isDashing() {
    return performance.now() / 1000 < this.dashUntil;
  }

  get isInvulnerable() {
    return performance.now() / 1000 < this.invulnerableUntil;
  }

  get hasMagnet() {
    return performance.now() / 1000 < this.magnetUntil;
  }

  startDash(now) {
    if (now < this.dashReadyAt) return false;
    this.dashUntil = now + CONFIG.player.dashTimeSec;
    this.dashReadyAt = now + CONFIG.player.dashCooldownSec;
    const speed = Math.hypot(this.vx, this.vy) || 1;
    const nx = this.vx / speed;
    const ny = this.vy / speed;
    this.vx = nx * CONFIG.player.dashSpeed;
    this.vy = ny * CONFIG.player.dashSpeed;
    return true;
  }

  update(dt, move, mouseSteer) {
    const now = performance.now() / 1000;
    const p = CONFIG.player;
    if (this.isDashing) {
      // During a dash the moth flies straight and fast.
    } else {
      this.vx += move.x * p.accel * dt;
      this.vy += move.y * p.accel * dt;
      if (mouseSteer) {
        const dx = mouseSteer.x - this.x;
        const dy = mouseSteer.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d > 24) {
          this.vx += (dx / d) * p.accel * 0.7 * dt;
          this.vy += (dy / d) * p.accel * 0.7 * dt;
        }
      }
      this.vx *= Math.pow(p.friction, dt * 60);
      this.vy *= Math.pow(p.friction, dt * 60);
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > p.maxSpeed) {
        this.vx = (this.vx / speed) * p.maxSpeed;
        this.vy = (this.vy / speed) * p.maxSpeed;
      }
    }
    this.x = clamp(this.x + this.vx * dt, this.radius, W - this.radius);
    this.y = clamp(this.y + this.vy * dt, this.radius, H - this.radius);
    if (Math.hypot(this.vx, this.vy) > 20) {
      this.angle = Math.atan2(this.vy, this.vx);
    }
    this.wingPhase += dt * (this.isDashing ? 30 : 14);
    this.trail.push({ x: this.x, y: this.y, life: 0.3 });
    if (this.trail.length > 14) this.trail.shift();
    for (const t of this.trail) t.life -= dt;
    this.trail = this.trail.filter((t) => t.life > 0);
  }
}

export class Ember {
  constructor() {
    this.x = rand(40, W - 40);
    this.y = rand(50, H - 120);
    this.radius = CONFIG.ember.radius;
    this.phase = rand(0, Math.PI * 2);
    this.drift = rand(-1, 1);
    this.value = CONFIG.ember.baseValue;
    this.born = performance.now() / 1000;
  }

  update(dt) {
    this.phase += dt * 3;
    this.x += this.drift * CONFIG.ember.driftSpeed * dt;
    if (this.x < 30 || this.x > W - 30) this.drift *= -1;
  }
}

export class Wisp {
  constructor(wave) {
    // Wisps slip in from a screen edge, never on top of the player.
    const edge = randIntEdge();
    if (edge === 0) { this.x = -20; this.y = rand(40, H - 40); }
    else if (edge === 1) { this.x = W + 20; this.y = rand(40, H - 40); }
    else if (edge === 2) { this.x = rand(40, W - 40); this.y = -20; }
    else { this.x = rand(40, W - 40); this.y = H + 20; }
    this.radius = CONFIG.wisp.radius;
    this.speed = CONFIG.wisp.baseSpeed + CONFIG.wisp.speedPerWave * (wave - 1);
    this.angle = rand(0, Math.PI * 2);
    this.wobble = rand(0, Math.PI * 2);
    this.slowUntil = 0;
  }

  update(dt, target) {
    const now = performance.now() / 1000;
    const desired = angleTo(this.x, this.y, target.x, target.y);
    let diff = desired - this.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const turn = CONFIG.wisp.turnRate * dt;
    this.angle += Math.max(-turn, Math.min(turn, diff));
    this.wobble += dt * 2.2;
    const speed = this.speed * (now < this.slowUntil ? 0.45 : 1);
    const wobble = Math.sin(this.wobble) * 0.35;
    this.x += Math.cos(this.angle + wobble) * speed * dt;
    this.y += Math.sin(this.angle + wobble) * speed * dt;
    this.x = clamp(this.x, -30, W + 30);
    this.y = clamp(this.y, -30, H + 30);
  }
}

function randIntEdge() {
  return Math.floor(Math.random() * 4);
}

export const POWERUP_KINDS = ['shield', 'magnet', 'slow'];

export class PowerUp {
  constructor() {
    this.kind = pick(POWERUP_KINDS);
    this.x = rand(50, W - 50);
    this.y = rand(60, H - 140);
    this.radius = CONFIG.powerUp.radius;
    this.phase = rand(0, Math.PI * 2);
    this.life = 9; // seconds before it fades away unclaimed
  }

  update(dt) {
    this.phase += dt * 2.5;
    this.life -= dt;
  }
}
