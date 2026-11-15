// Render: everything the player sees, drawn on one canvas. No images are
// loaded — every shape is drawn from code, so the game works with no files
// beyond its scripts.

import { CONFIG } from './config.js';

const W = CONFIG.viewWidth;
const H = CONFIG.viewHeight;

// A fixed starfield so the night sky is stable between frames.
const STARS = [];
for (let i = 0; i < 90; i += 1) {
  STARS.push({
    x: Math.random() * W,
    y: Math.random() * H * 0.62,
    r: 0.6 + Math.random() * 1.4,
    tw: Math.random() * Math.PI * 2,
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawBackground(ctx, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0b1030');
  sky.addColorStop(0.55, '#1b2350');
  sky.addColorStop(1, '#2c3a6e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  for (const s of STARS) {
    ctx.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(time * 0.7 + s.tw));
    ctx.fillStyle = '#dfe6ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // The moon, high on the right.
  const moon = ctx.createRadialGradient(828, 84, 6, 828, 84, 46);
  moon.addColorStop(0, 'rgba(255, 246, 200, 0.95)');
  moon.addColorStop(0.35, 'rgba(255, 240, 180, 0.55)');
  moon.addColorStop(1, 'rgba(255, 240, 180, 0)');
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(828, 84, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff6c8';
  ctx.beginPath();
  ctx.arc(828, 84, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(220, 200, 140, 0.5)';
  ctx.beginPath();
  ctx.arc(820, 78, 5, 0, Math.PI * 2);
  ctx.arc(838, 92, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Rolling hills at the bottom, where the lantern posts stand.
  ctx.fillStyle = '#141a3a';
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, H - 66);
  ctx.quadraticCurveTo(240, H - 110, 480, H - 64);
  ctx.quadraticCurveTo(720, H - 30, W, H - 78);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0e1330';
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, H - 26);
  ctx.quadraticCurveTo(300, H - 56, 620, H - 22);
  ctx.quadraticCurveTo(820, H - 8, W, H - 34);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Two lantern posts that glow when the moth is near.
  drawLantern(ctx, 84, H - 74, time);
  drawLantern(ctx, W - 84, H - 74, time + 1.3);
}

function drawLantern(ctx, x, y, time) {
  const glow = 0.5 + 0.3 * Math.sin(time * 2);
  const g = ctx.createRadialGradient(x, y - 26, 2, x, y - 26, 42);
  g.addColorStop(0, `rgba(255, 200, 90, ${0.5 * glow})`);
  g.addColorStop(1, 'rgba(255, 200, 90, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y - 26, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2c18';
  ctx.fillRect(x - 3, y - 26, 6, 26);
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.arc(x, y - 30, 9, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEmber(ctx, ember) {
  const pulse = 1 + 0.18 * Math.sin(ember.phase);
  const r = ember.radius * pulse;
  const glow = ctx.createRadialGradient(ember.x, ember.y, 1, ember.x, ember.y, r * 3);
  glow.addColorStop(0, 'rgba(255, 214, 110, 0.85)');
  glow.addColorStop(0.4, 'rgba(255, 170, 60, 0.35)');
  glow.addColorStop(1, 'rgba(255, 170, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(ember.x, ember.y, r * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(ember.x, ember.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffbe8';
  ctx.beginPath();
  ctx.arc(ember.x - r * 0.25, ember.y - r * 0.25, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

export function drawWisp(ctx, wisp, time) {
  const flicker = 1 + 0.12 * Math.sin(time * 6 + wisp.wobble);
  const r = wisp.radius * flicker;
  const smoke = ctx.createRadialGradient(wisp.x, wisp.y, 2, wisp.x, wisp.y, r * 1.9);
  smoke.addColorStop(0, 'rgba(88, 70, 140, 0.9)');
  smoke.addColorStop(0.6, 'rgba(52, 40, 96, 0.55)');
  smoke.addColorStop(1, 'rgba(52, 40, 96, 0)');
  ctx.fillStyle = smoke;
  ctx.beginPath();
  ctx.arc(wisp.x, wisp.y, r * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241a44';
  ctx.beginPath();
  ctx.arc(wisp.x, wisp.y, r, 0, Math.PI * 2);
  ctx.fill();
  // Two pale eyes that track the moth.
  const ex = Math.cos(wisp.angle) * 4;
  const ey = Math.sin(wisp.angle) * 4;
  ctx.fillStyle = '#cfe8ff';
  ctx.beginPath();
  ctx.arc(wisp.x - 5 + ex, wisp.y - 3 + ey, 2.6, 0, Math.PI * 2);
  ctx.arc(wisp.x + 5 + ex, wisp.y - 3 + ey, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1230';
  ctx.beginPath();
  ctx.arc(wisp.x - 5 + ex * 1.4, wisp.y - 3 + ey * 1.4, 1.2, 0, Math.PI * 2);
  ctx.arc(wisp.x + 5 + ex * 1.4, wisp.y - 3 + ey * 1.4, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

const POWERUP_STYLE = {
  shield: { color: '#7dd3fc', label: 'S' },
  magnet: { color: '#f472b6', label: 'M' },
  slow: { color: '#a3e635', label: 'T' },
};

export function drawPowerUp(ctx, powerUp) {
  const style = POWERUP_STYLE[powerUp.kind];
  const pulse = 1 + 0.15 * Math.sin(powerUp.phase);
  const alpha = powerUp.life < 2 ? 0.35 + 0.35 * Math.sin(powerUp.phase * 6) : 1;
  ctx.globalAlpha = Math.max(0.15, alpha);
  const glow = ctx.createRadialGradient(powerUp.x, powerUp.y, 1, powerUp.x, powerUp.y, 34);
  glow.addColorStop(0, style.color);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.35 * Math.max(0.15, alpha);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(powerUp.x, powerUp.y, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = Math.max(0.15, alpha);
  ctx.fillStyle = '#101736';
  ctx.beginPath();
  ctx.arc(powerUp.x, powerUp.y, powerUp.radius * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = style.color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = style.color;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(style.label, powerUp.x, powerUp.y + 1);
  ctx.globalAlpha = 1;
}

export function drawPlayer(ctx, player, time) {
  // Motion trail.
  for (const t of player.trail) {
    ctx.globalAlpha = (t.life / 0.3) * 0.35;
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(t.x, t.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const blink = player.isInvulnerable && Math.floor(time * 12) % 2 === 0;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  if (blink) ctx.globalAlpha = 0.35;

  // Wing glow.
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 46);
  glow.addColorStop(0, 'rgba(255, 214, 106, 0.5)');
  glow.addColorStop(1, 'rgba(255, 214, 106, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.fill();

  // Flapping wings.
  const flap = Math.sin(player.wingPhase) * 0.55;
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.ellipse(-4, -13 - flap * 6, 13, 7 + flap * 3, -0.5 - flap * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-4, 13 + flap * 6, 13, 7 + flap * 3, 0.5 + flap * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7b733';
  ctx.beginPath();
  ctx.ellipse(-6, -11 - flap * 5, 7, 4, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-6, 11 + flap * 5, 7, 4, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Body and head.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d3a17';
  ctx.beginPath();
  ctx.arc(12, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  // Antennae.
  ctx.strokeStyle = '#5d3a17';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(15, -3);
  ctx.quadraticCurveTo(21, -10, 24, -13);
  ctx.moveTo(15, 3);
  ctx.quadraticCurveTo(21, 10, 24, 13);
  ctx.stroke();
  // Eye.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(14, -2, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(14.8, -2, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Shield ring.
  if (player.shield) {
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Magnet ring.
  if (player.hasMagnet) {
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, CONFIG.powerUp.magnetRadius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function drawHud(ctx, hud) {
  ctx.textBaseline = 'alphabetic';
  // Top bar.
  ctx.fillStyle = 'rgba(8, 12, 34, 0.55)';
  roundRect(ctx, 10, 10, W - 20, 52, 12);
  ctx.fill();

  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${hud.score}`, 26, 36);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = hud.combo > 1 ? '#ffb347' : '#9aa7d8';
  ctx.fillText(hud.combo > 1 ? `COMBO x${hud.combo}` : 'COMBO —', 26, 54);

  // Hearts.
  for (let i = 0; i < hud.maxHearts; i += 1) {
    const x = 250 + i * 30;
    const y = 36;
    ctx.fillStyle = i < hud.hearts ? '#ff6b81' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    ctx.bezierCurveTo(x - 10, y - 4, x - 5, y - 12, x, y - 5);
    ctx.bezierCurveTo(x + 5, y - 12, x + 10, y - 4, x, y + 6);
    ctx.fill();
  }

  // Wave and quota.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dfe6ff';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`WAVE ${hud.wave} / ${hud.totalWaves}`, W / 2, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  roundRect(ctx, W / 2 - 110, 38, 220, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  roundRect(ctx, W / 2 - 110, 38, 220 * Math.min(1, hud.quotaDone / hud.quota), 10, 5);
  ctx.fill();
  ctx.fillStyle = '#dfe6ff';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`Embers ${hud.quotaDone} / ${hud.quota}`, W / 2, 62);

  // Timer and dash.
  ctx.textAlign = 'right';
  const t = Math.max(0, Math.ceil(hud.timeLeft));
  const mm = Math.floor(t / 60);
  const ss = String(t % 60).padStart(2, '0');
  ctx.fillStyle = t <= 15 ? '#ff8a7a' : '#dfe6ff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(`DAWN ${mm}:${ss}`, W - 26, 34);
  ctx.fillStyle = '#9aa7d8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(
    hud.dashCooldown > 0 ? `Dash ready in ${hud.dashCooldown.toFixed(1)}s` : 'Dash ready — SPACE / CLICK',
    W - 26,
    54,
  );

  // Floating score popups.
  for (const pop of hud.popups) {
    ctx.globalAlpha = Math.max(0, pop.life / pop.maxLife);
    ctx.fillStyle = pop.color;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pop.text, pop.x, pop.y);
  }
  ctx.globalAlpha = 1;

  // Wave banner.
  if (hud.banner) {
    ctx.globalAlpha = Math.min(1, hud.banner.life * 2);
    ctx.fillStyle = '#fff6c8';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hud.banner.text, W / 2, 150);
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#dfe6ff';
    ctx.fillText(hud.banner.sub, W / 2, 178);
    ctx.globalAlpha = 1;
  }
}

function panel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(6, 10, 30, 0.72)';
  roundRect(ctx, W / 2 - 300, 96, 600, 380, 18);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundRect(ctx, W / 2 - 300, 96, 600, 380, 18);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillText(title, W / 2, 168);
  ctx.fillStyle = '#e8edff';
  ctx.font = '18px system-ui, sans-serif';
  let y = 212;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += 30;
  }
  return y;
}

export function drawTitle(ctx, best) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff6c8';
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillText('EMBERLIGHT', W / 2, 168);
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText("— A Moth's Harvest —", W / 2, 204);
  ctx.fillStyle = '#dfe6ff';
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('Guide Luma the lantern-moth through the night.', W / 2, 252);
  ctx.fillText('Gather glowing embers. Dodge the shadow wisps.', W / 2, 278);
  ctx.fillText('Fill each wave quota before dawn breaks.', W / 2, 304);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('WASD / ARROWS or MOUSE — fly', W / 2, 352);
  ctx.fillText('SPACE or CLICK — dash (briefly untouchable)', W / 2, 378);
  ctx.fillText('P — pause · M — mute · R — restart', W / 2, 404);
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('▶  Press ENTER or CLICK to start', W / 2, 462);
  if (best > 0) {
    ctx.fillStyle = '#9aa7d8';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText(`Best score: ${best}`, W / 2, 498);
  }
}

export function drawPaused(ctx) {
  panel(ctx, 'PAUSED', [
    'Take a breath, little moth.',
    '',
    'Press P or CLICK to keep flying',
    'Press R to start over',
  ], '#7dd3fc');
}

export function drawWin(ctx, result) {
  const y = panel(ctx, 'DAWN BREAKS!', [
    'Luma gathered every ember the night asked for.',
    `Final score: ${result.score}`,
    `Embers gathered: ${result.embers}   ·   Best combo: x${result.bestCombo}`,
    `Time bonus: +${result.timeBonus}   ·   Heart bonus: +${result.heartBonus}`,
    '',
    'Press R or CLICK to fly again',
  ], '#ffd76a');
  void y;
}

export function drawLose(ctx, result) {
  const reason = result.reason === 'time'
    ? 'Dawn broke before the final quota was filled.'
    : 'The wisps caught Luma one too many times.';
  const y = panel(ctx, 'THE NIGHT FADES', [
    reason,
    `Score: ${result.score}   ·   Wave reached: ${result.wave}`,
    `Embers gathered: ${result.embers}   ·   Best combo: x${result.bestCombo}`,
    '',
    'Press R or CLICK to try again',
  ], '#ff8a7a');
  void y;
}
