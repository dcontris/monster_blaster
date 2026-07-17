const STORAGE_KEY = "monster-blaster-dev-tuning";

export const DEFAULT_TUNING = Object.freeze({
  playerHealth: 100, playerSpeed: 250, dashSpeed: 710, dashDuration: 175, dashCooldown: 1000,
  blasterInterval: 300, blasterMinimumInterval: 90, projectileSpeed: 530, projectileDamage: 14,
  projectileSpeedUpgrade: 48, projectileDamageUpgrade: 6, fireRateUpgrade: 19, spreadPerProjectile: 7,
  waveBaseCount: 3, waveScaleFactor: 1.2, waveStartDelay: 850, waveDelay: 900, wavesPerRoom: 2,
  enemyHealthMultiplier: 1, enemyDamageMultiplier: 1, enemySpeedMultiplier: 1, rangedProjectileSpeed: 300,
  bossHealth: 1500, bossSpeed: 50, bossDamage: 23, bossProjectileSpeed: 275, bossFireInterval: 1450, bossSummonInterval: 4300,
  chaserHealth: 26, chaserSpeed: 92, chaserDamage: 11,
  rangedHealth: 36, rangedSpeed: 65, rangedDamage: 9,
  tankHealth: 105, tankSpeed: 42, tankDamage: 18,
  splitterHealth: 44, splitterSpeed: 75, splitterDamage: 12,
  miniHealth: 12, miniSpeed: 125, miniDamage: 7,
  orbiterHealth: 52, orbiterSpeed: 72, orbiterDamage: 9,
  ambusherHealth: 38, ambusherSpeed: 88, ambusherDamage: 14,
  summonerHealth: 68, summonerSpeed: 54, summonerDamage: 10,
});

const slider = (key, label, min, max, step = 1) => ({ key, label, min, max, step });
const monsterSliders = (type, label) => [
  slider(`${type}Health`, `${label} health`, 1, 400),
  slider(`${type}Speed`, `${label} speed`, 1, 300),
  slider(`${type}Damage`, `${label} damage`, 0, 100),
];

const SLIDER_GROUPS = [
  { label: "Player", sliders: [
    slider("playerHealth", "Health", 1, 500), slider("playerSpeed", "Move speed", 20, 700),
    slider("dashSpeed", "Dash speed", 50, 1500), slider("dashDuration", "Dash duration", 0, 1000),
    slider("dashCooldown", "Dash cooldown", 0, 5000),
  ] },
  { label: "Blaster", sliders: [
    slider("blasterInterval", "Fire interval", 20, 1000), slider("blasterMinimumInterval", "Minimum interval", 10, 500),
    slider("projectileSpeed", "Projectile speed", 50, 1500), slider("projectileDamage", "Projectile damage", 1, 200),
    slider("projectileSpeedUpgrade", "Speed upgrade", 0, 200), slider("projectileDamageUpgrade", "Damage upgrade", 0, 50),
    slider("fireRateUpgrade", "Rate upgrade", 0, 100), slider("spreadPerProjectile", "Spread per projectile", 0, 30),
  ] },
  { label: "Encounters", sliders: [
    slider("waveBaseCount", "Base wave count", 0, 20), slider("waveScaleFactor", "Wave scale factor", 0, 5, 0.1),
    slider("wavesPerRoom", "Base waves per room", 1, 10), slider("waveStartDelay", "Room start delay", 0, 5000),
    slider("waveDelay", "Wave delay", 0, 5000), slider("enemyHealthMultiplier", "Enemy health multiplier", 0.1, 5, 0.1),
    slider("enemyDamageMultiplier", "Enemy damage multiplier", 0, 5, 0.1), slider("enemySpeedMultiplier", "Enemy speed multiplier", 0.1, 5, 0.1),
    slider("rangedProjectileSpeed", "Ranged projectile speed", 20, 1000),
  ] },
  { label: "Boss", sliders: [
    slider("bossHealth", "Health", 50, 10000), slider("bossSpeed", "Speed", 1, 500),
    slider("bossDamage", "Contact damage", 0, 200), slider("bossProjectileSpeed", "Projectile speed", 20, 1000),
    slider("bossFireInterval", "Fire interval", 100, 5000), slider("bossSummonInterval", "Summon interval", 100, 10000),
  ] },
  { label: "Monster base stats", sliders: [
    ...monsterSliders("chaser", "Chaser"), ...monsterSliders("ranged", "Ranged"),
    ...monsterSliders("tank", "Tank"), ...monsterSliders("splitter", "Splitter"),
    ...monsterSliders("mini", "Mini"), ...monsterSliders("orbiter", "Orbiter"),
    ...monsterSliders("ambusher", "Ambusher"), ...monsterSliders("summoner", "Summoner"),
  ] },
];

export function loadTuning() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return Object.fromEntries(Object.entries(DEFAULT_TUNING).map(([key, value]) => {
    const savedValue = Number(saved[key]);
    return [key, Number.isFinite(savedValue) ? savedValue : value];
  }));
}

export function createDeveloperControls(tuning, togglePause) {
  const panel = document.querySelector("#dev-panel");
  const pauseButton = document.querySelector("#pause-button");
  const saveButton = document.querySelector("#save-tuning");
  const resetButton = document.querySelector("#reset-tuning");
  const status = document.querySelector("#tuning-status");

  SLIDER_GROUPS.forEach(({ label, sliders }) => {
    const group = document.createElement("details");
    group.open = label === "Player" || label === "Blaster";
    const heading = document.createElement("summary");
    heading.textContent = label;
    group.append(heading);
    sliders.forEach(({ key, label: sliderLabel, min, max, step }) => {
      const row = document.createElement("label");
      row.className = "tuning-slider";
      const name = document.createElement("span");
      name.textContent = sliderLabel;
      const value = document.createElement("output");
      const input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = tuning[key];
      input.dataset.key = key;
      const update = () => {
        tuning[key] = Number(input.value);
        value.value = input.value;
        value.textContent = input.value;
      };
      input.addEventListener("input", update);
      update();
      row.append(name, value, input);
      group.append(row);
    });
    panel.append(group);
  });

  pauseButton.addEventListener("click", togglePause);
  saveButton.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tuning));
    status.textContent = "Saved";
  });
  resetButton.addEventListener("click", () => {
    Object.assign(tuning, DEFAULT_TUNING);
    panel.querySelectorAll("input").forEach((input) => {
      input.value = tuning[input.dataset.key];
      input.dispatchEvent(new Event("input"));
    });
    localStorage.removeItem(STORAGE_KEY);
    status.textContent = "Defaults restored";
  });

  return {
    setGameActive(active) {
      pauseButton.hidden = !active;
      if (!active) panel.hidden = true;
    },
    setPaused(paused) {
      panel.hidden = !paused;
      pauseButton.textContent = paused ? "RESUME" : "PAUSE";
      status.textContent = paused ? "Tune values, then save or resume" : "";
    },
  };
}
