export function updateSplitterMovement(monster, player, time, randomAngle, randomDelay) {
  const needsInitialDirection = !Number.isFinite(monster.zigZagAngle);

  if (!needsInitialDirection && time < monster.movementUntil) return;

  const baseAngle = Math.atan2(player.y - monster.sprite.y, player.x - monster.sprite.x);
  monster.zigZagAngle = baseAngle + (needsInitialDirection ? 0 : randomAngle());

  if (!needsInitialDirection) {
    monster.movementUntil = time + randomDelay();
  }
}
