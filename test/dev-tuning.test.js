import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SLIDER_LIMITS, loadSliderLimits } from "../src/dev-tuning.js";

test("loads slider limits that extend the defaults", () => {
  globalThis.localStorage = {
    getItem: () => JSON.stringify({ tankHealth: 1000, playerHealth: 0 }),
  };

  const limits = loadSliderLimits();

  assert.equal(limits.tankHealth, 1000);
  assert.equal(limits.playerHealth, DEFAULT_SLIDER_LIMITS.playerHealth);
});
