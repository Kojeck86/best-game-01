// Emberlight bootstrap: size the canvas, create the game and start its loop.
// Everything else lives in game.js and the modules it imports.

import { Game } from './game.js';
import { CONFIG } from './config.js';

const canvas = document.getElementById('game');
canvas.width = CONFIG.viewWidth;
canvas.height = CONFIG.viewHeight;

const game = new Game(canvas);
game.run();

// A tiny test hook for play-testing: it only exposes the running game object
// (read its state, or jump to an end screen to check the art). It changes no
// gameplay and is never needed to play.
window.__emberlight = game;
