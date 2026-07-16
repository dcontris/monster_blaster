import test from "node:test";
import assert from "node:assert/strict";
import { updateSplitterMovement } from "../src/monster-movement.js";

test("initializes a splitters direction before its first scheduled turn", () => {
  const monster = {
    sprite: { x: 56, y: 220 },
    movementUntil: 800,
    zigZagAngle: undefined,
  };

  updateSplitterMovement(monster, { x: 512, y: 320 }, 100, () => 1, () => 150);

  assert.ok(Number.isFinite(monster.zigZagAngle));
  assert.equal(monster.movementUntil, 800);
});
