// Particles: short-lived sparks, glows and drifting motes that give every
// action visible feedback. The system owns its list; the game only spawns.

import { rand } from './random.js';

export class Particles {
  constructor() {
    this.list = [];
  }

  burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const a = rand(0, Math.PI * 2);
      const v = rand(speed * 0.3, speed);
      this.list.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: rand(0.35, 0.8),
        maxLife: 0.8,
        size: rand(2, 5),
        color,
      });
    }
  }

  // A soft rising mote, used for ambient fireflies on the title screen.
  mote(x, y, color) {
    this.list.push({
      x, y,
      vx: rand(-8, 8),
      vy: rand(-26, -10),
      life: rand(1.2, 2.4),
      maxLife: 2.4,
      size: rand(1.5, 3),
      color,
    });
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i -= 1) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
    }
  }

  draw(ctx) {
    for (const p of this.list) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.list.length = 0;
  }
}
