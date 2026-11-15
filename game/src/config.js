// Emberlight tuning: every number that shapes how the game feels lives here,
// so balance can be changed without touching the logic in the other modules.

export const CONFIG = {
  // Canvas the game draws into (CSS scales it to the window).
  viewWidth: 960,
  viewHeight: 600,

  // The night lasts this long; dawn ends the run if the final quota is unmet.
  nightLengthSec: 120,

  // Player: Luma, the lantern-moth.
  player: {
    radius: 16,
    accel: 2400,
    maxSpeed: 340,
    friction: 0.86,
    dashSpeed: 780,
    dashTimeSec: 0.16,
    dashCooldownSec: 1.1,
    invulnerableSec: 1.2,
    startHearts: 3,
  },

  // Embers: the glowing light the moth harvests.
  ember: {
    radius: 10,
    baseValue: 10,
    spawnIntervalSec: 0.55,
    maxOnField: 14,
    driftSpeed: 22,
    comboWindowSec: 2.5,
    maxCombo: 5,
  },

  // Wisps: shadow chasers that cost a heart on touch.
  wisp: {
    radius: 15,
    baseSpeed: 88,
    speedPerWave: 16,
    spawnIntervalSec: 2.6,
    maxOnField: 9,
    turnRate: 2.6,
  },

  // Power-ups: rare blooms that help the moth.
  powerUp: {
    radius: 13,
    spawnIntervalSec: 14,
    magnetDurationSec: 6,
    slowDurationSec: 5,
    magnetRadius: 190,
  },

  // Waves: each wave asks for a quota of embers before the next dawn-chime.
  waves: [
    { quota: 8, wisps: 2, emberValue: 10 },
    { quota: 12, wisps: 3, emberValue: 10 },
    { quota: 16, wisps: 4, emberValue: 15 },
    { quota: 20, wisps: 5, emberValue: 15 },
    { quota: 26, wisps: 6, emberValue: 20 },
  ],

  // Scoring bonuses.
  score: {
    waveClearBonus: 250,
    heartBonusOnWin: 500,
    timeBonusPerSec: 5,
  },
};
