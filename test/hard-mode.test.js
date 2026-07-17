import test from "node:test";
import assert from "node:assert/strict";
import { HARD_MODE, hardModeScale, scaledEnemyCount } from "../src/hard-mode.js";

test("uses the agreed Hard mode combat multipliers", () => {
  assert.deepEqual(HARD_MODE, {
    health: 1.35,
    damage: 1.35,
    speed: 1.2,
    count: 1.75,
  });
  assert.equal(hardModeScale("health", true), 1.35);
  assert.equal(hardModeScale("damage", true), 1.35);
  assert.equal(hardModeScale("speed", true), 1.2);
});

test("rounds Hard mode enemy counts up without affecting Baseline", () => {
  assert.equal(scaledEnemyCount(3, false), 3);
  assert.equal(scaledEnemyCount(3, true), 6);
  assert.equal(scaledEnemyCount(8, true), 14);
});
