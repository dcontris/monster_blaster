export function skippedRoomCount(startingRoom, startingBoss) {
  return startingBoss ? 10 : startingRoom - 1;
}

export function grantSkippedRoomModifiers(modifiers, completedRooms, randomModifier) {
  for (let i = 0; i < completedRooms * 2; i += 1) {
    modifiers[randomModifier()] += 1;
  }
}
