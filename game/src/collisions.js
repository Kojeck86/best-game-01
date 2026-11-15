// Collisions: every touch test in the game is a circle test, kept in one
// place so the radii in config.js are the only numbers that matter.

export function circlesHit(a, b) {
  const r = a.radius + b.radius;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < r * r;
}

export function circlePoint(cx, cy, radius, px, py) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy < radius * radius;
}
