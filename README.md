# Emberlight — A Moth's Harvest

A make.fun `best-game-01` entry. Guide Luma, a little lantern-moth, through
the night: gather glowing embers, dodge the shadow wisps, fill each wave's
quota before dawn breaks.

- **Play:** open `game/index.html` in a desktop browser (or serve `game/`
  with any static server). No build step, no network requests.
- **Controls:** WASD / arrows or hold the mouse to fly, SPACE or CLICK to
  dash, P to pause, M to mute, R to restart.
- **Rules:** 5 waves with growing quotas and faster wisps; 3 hearts; a 120
  second night clock. Combos multiply ember points; shield, magnet and
  slow-dew blooms help along the way. Finish wave 5 to win.
- **Sound:** synthesized live with WebAudio — no audio files shipped.
- **Hand in:** `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`
