// Small random helpers shared by the spawners. Nothing here depends on the
// game state, so it can be tested on its own.

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

export function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}
