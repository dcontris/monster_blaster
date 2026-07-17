export const HARD_MODE = {
  health: 1.35,
  damage: 1.35,
  speed: 1.2,
  count: 1.75,
};

export function scaledEnemyCount(count, hardMode) {
  return hardMode ? Math.ceil(count * HARD_MODE.count) : count;
}

export function hardModeScale(stat, hardMode) {
  return hardMode ? HARD_MODE[stat] : 1;
}
