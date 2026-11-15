// Input: keyboard state plus mouse position, translated into one steering
// vector the player update can consume. The game reads this, never the DOM
// events directly.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, inside: false, down: false };
    this._pressed = new Set();
    this._mousePressed = false;
    this._canvas = canvas;

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (!e.repeat) this._pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      this.mouse.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      this.mouse.inside = true;
    });
    canvas.addEventListener('mouseleave', () => {
      this.mouse.inside = false;
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.down = true;
        this._mousePressed = true;
      }
    });
    window.addEventListener('mouseup', () => {
      this.mouse.down = false;
    });
    // A lost window focus must not leave keys stuck down.
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouse.down = false;
    });
  }

  // True only on the frame the key went down; callers consume it once.
  wasPressed(key) {
    return this._pressed.has(key.toLowerCase());
  }

  // True only on the frame the left mouse button went down.
  mousePressed() {
    return this._mousePressed;
  }

  // Drop any pending press edges (used when a click starts the game, so the
  // same click is not also read as a dash on the first playing frame).
  consumePresses() {
    this._pressed.clear();
    this._mousePressed = false;
  }

  endFrame() {
    this._pressed.clear();
    this._mousePressed = false;
  }

  // WASD / arrows as a unit vector; zero when nothing is held.
  moveVector() {
    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  wantsDash() {
    return this.wasPressed(' ') || this.wasPressed('shift');
  }
}
