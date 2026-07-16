import test from "node:test";
import assert from "node:assert/strict";
import { grantSkippedRoomModifiers, skippedRoomCount } from "../src/dev-start.js";

test("grants two modifiers for each skipped combat room", () => {
  const modifiers = { damage: 0, rate: 0, count: 0, speed: 0, pierce: 0 };
  grantSkippedRoomModifiers(modifiers, skippedRoomCount(4, false), () => "damage");

  assert.equal(modifiers.damage, 6);
  assert.equal(Object.values(modifiers).reduce((total, value) => total + value, 0), 6);
});

test("treats a boss start as ten completed combat rooms", () => {
  assert.equal(skippedRoomCount(1, true), 10);
});
