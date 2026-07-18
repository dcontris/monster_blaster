import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SLIDER_LIMITS, loadSliderLimits } from "../src/dev-tuning.js";

test("loads slider limits that extend the defaults", () => {
  globalThis.localStorage = {
    getItem: () => JSON.stringify({ tankHealth: 50, playerHealth: 0 }),
  };

  const limits = loadSliderLimits();

  assert.equal(limits.tankHealth, 50);
  assert.equal(limits.playerHealth, DEFAULT_SLIDER_LIMITS.playerHealth);
});
