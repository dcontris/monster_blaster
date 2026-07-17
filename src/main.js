import Phaser from "phaser";
import "./style.css";
import gameplayMusicUrl from "../assets/sound/music/track1.mp3";
import { grantSkippedRoomModifiers, skippedRoomCount } from "./dev-start.js";
import { hardModeScale, scaledEnemyCount } from "./hard-mode.js";
import { updateSplitterMovement } from "./monster-movement.js";
import { createDeveloperControls, loadTuning } from "./dev-tuning.js";

const WIDTH = 1024;
const HEIGHT = 640;
const ARENA = { left: 38, right: WIDTH - 38, top: 76, bottom: HEIGHT - 36 };
const MONSTER_VISUALS = {
  chaser: { size: 15, color: 0x78c850 },
  ranged: { size: 16, color: 0x6aa8dd },
  tank: { size: 25, color: 0xbf6f74 },
  splitter: { size: 18, color: 0xc780d7 },
  mini: { size: 9, color: 0xe3b0eb },
  orbiter: { size: 18, color: 0x68d7c1 },
  ambusher: { size: 14, color: 0xf2a65a },
  summoner: { size: 20, color: 0xf0d06c },
};

class Sfx {
  constructor() {
    this.context = null;
  }

  unlock() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === "suspended") {
      this.context.resume();
    }
  }

  play(frequency, duration = 0.06, type = "square", volume = 0.035) {
    if (!this.context || this.context.state !== "running") return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
}

class StartScene extends Phaser.Scene {
  constructor() {
    super("start");
  }

  preload() {
    this.load.audio("gameplayMusic", gameplayMusicUrl);
  }

  create() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x130d23);
    this.add.text(WIDTH / 2, 122, "MONSTER\nBLASTER", {
      fontFamily: "Courier New",
      fontSize: "58px",
      fontStyle: "bold",
      color: "#f8c555",
      align: "center",
      stroke: "#511d54",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 252, "A PIXEL-FANTASY ENDLESS BLAST", {
      fontFamily: "Courier New",
      fontSize: "19px",
      color: "#e3b0eb",
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 322, "Clear 10 combat rooms.\nSurvive milestone Onslaughts.\nBuild your Blaster.\nSurvive the Mega Boss.\nThen see how far you can get.", {
      fontFamily: "Courier New",
      fontSize: "15px",
      color: "#f8efcf",
      align: "center",
      lineSpacing: 6,
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 398, "STARTING ROOM", {
      fontFamily: "Courier New",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#b8a5d6",
    }).setOrigin(0.5);

    let selectedRoom = 1;
    let selectedBoss = false;
    const roomButtons = [];
    let bossButton;
    let bossLabel;
    const updateSelection = () => {
      roomButtons.forEach(({ room: buttonRoom, button, label }) => {
        const selected = !selectedBoss && buttonRoom === selectedRoom;
        button.setFillStyle(selected ? 0x593a78 : 0x35234f);
        button.setStrokeStyle(2, selected ? 0xf8c555 : 0x8e6cab);
        label.setColor(selected ? "#f8c555" : "#f8efcf");
      });
      bossButton.setFillStyle(selectedBoss ? 0x593a78 : 0x35234f);
      bossButton.setStrokeStyle(2, selectedBoss ? 0xf8c555 : 0x8e6cab);
      bossLabel.setColor(selectedBoss ? "#f8c555" : "#f8efcf");
    };
    const selectRoom = (room) => {
      selectedRoom = room;
      selectedBoss = false;
      updateSelection();
    };

    for (let room = 1; room <= 10; room += 1) {
      const column = (room - 1) % 5;
      const row = Math.floor((room - 1) / 5);
      const x = WIDTH / 2 - 152 + column * 76;
      const y = 436 + row * 40;
      const button = this.add.rectangle(x, y, 60, 34, 0x35234f).setStrokeStyle(2, 0x8e6cab).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, y, String(room), {
        fontFamily: "Courier New", fontSize: "18px", fontStyle: "bold", color: "#f8efcf",
      }).setOrigin(0.5);
      button.on("pointerdown", () => selectRoom(room));
      roomButtons.push({ room, button, label });
    }
    bossButton = this.add.rectangle(WIDTH / 2, 516, 150, 30, 0x35234f).setStrokeStyle(2, 0x8e6cab).setInteractive({ useHandCursor: true });
    bossLabel = this.add.text(WIDTH / 2, 516, "MEGA BOSS", {
      fontFamily: "Courier New", fontSize: "16px", fontStyle: "bold", color: "#f8efcf",
    }).setOrigin(0.5);
    bossButton.on("pointerdown", () => {
      selectedBoss = true;
      updateSelection();
    });
    selectRoom(selectedRoom);

    this.add.text(WIDTH / 2, 548, "RUN CONFIGURATION", {
      fontFamily: "Courier New",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#b8a5d6",
    }).setOrigin(0.5);
    let selectedHardMode = false;
    const modeButtons = [];
    const updateModeSelection = () => {
      modeButtons.forEach(({ hardMode, button, label }) => {
        const selected = hardMode === selectedHardMode;
        button.setFillStyle(selected ? 0x593a78 : 0x35234f);
        button.setStrokeStyle(2, selected ? 0xf8c555 : 0x8e6cab);
        label.setColor(selected ? "#f8c555" : "#f8efcf");
      });
    };
    [
      { hardMode: false, label: "BASELINE", x: WIDTH / 2 - 88 },
      { hardMode: true, label: "HARD MODE", x: WIDTH / 2 + 88 },
    ].forEach(({ hardMode, label: text, x }) => {
      const button = this.add.rectangle(x, 574, 156, 30, 0x35234f).setStrokeStyle(2, 0x8e6cab).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, 574, text, {
        fontFamily: "Courier New", fontSize: "15px", fontStyle: "bold", color: "#f8efcf",
      }).setOrigin(0.5);
      button.on("pointerdown", () => {
        selectedHardMode = hardMode;
        updateModeSelection();
      });
      modeButtons.push({ hardMode, button, label });
    });
    updateModeSelection();

    const start = this.add.text(WIDTH / 2, 618, "CLICK TO START", {
      fontFamily: "Courier New",
      fontSize: "21px",
      fontStyle: "bold",
      color: "#78c850",
      backgroundColor: "#25153c",
      padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: start, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
    start.on("pointerdown", () => {
      this.game.sfx.unlock();
      this.scene.start("game", { startingRoom: selectedRoom, startingBoss: selectedBoss, hardMode: selectedHardMode });
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init({ startingRoom = 1, startingBoss = false, hardMode = false } = {}) {
    this.startingRoom = Phaser.Math.Clamp(startingRoom, 1, 10);
    this.startingBoss = startingBoss;
    this.hardMode = hardMode;
  }

  create() {
    this.game.sfx.unlock();
    this.music = this.sound.add("gameplayMusic", { loop: true, volume: 0.3 });
    this.music.play();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.music.destroy();
      this.game.devControls.setGameActive(false);
    });
    this.createTextures();
    this.cameras.main.setBackgroundColor("#130d23");
    this.add.rectangle(WIDTH / 2, (ARENA.top + ARENA.bottom) / 2, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top, 0x21143a)
      .setStrokeStyle(3, 0x7a4b88)
      .setDepth(-2);
    this.warpEvents = [];
    this.drawFloor();
    this.player = this.add.sprite(WIDTH / 2, HEIGHT / 2, "player").setDepth(4);
    this.tuning = this.game.tuning;
    this.player.health = this.tuning.playerHealth;
    this.player.maxHealth = this.tuning.playerHealth;
    this.player.invulnerableUntil = 0;
    this.player.dashUntil = 0;
    this.player.dashReadyAt = 0;
    this.player.dashDirection = new Phaser.Math.Vector2(1, 0);
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.monsters = [];
    this.pendingSpawnCount = 0;
    this.room = this.startingRoom;
    this.endlessRoom = 0;
    this.isEndless = false;
    this.isBossFight = false;
    this.wave = 0;
    this.wavesInRoom = 0;
    this.nextWaveAt = 0;
    this.onslaughtPending = false;
    this.onslaughtTriggered = false;
    this.upgradeOpen = false;
    this.isTuningPaused = false;
    this.runStartedAt = this.time.now;
    this.modifiers = { damage: 0, rate: 0, count: 0, speed: 0, pierce: 0 };
    grantSkippedRoomModifiers(
      this.modifiers,
      skippedRoomCount(this.startingRoom, this.startingBoss),
      () => Phaser.Utils.Array.GetRandom(Object.keys(this.modifiers)),
    );
    this.lastShotAt = 0;
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D,SHIFT");
    this.input.keyboard.on("keydown-P", () => this.togglePaused());
    this.input.on("pointerdown", () => this.game.sfx.unlock());
    this.game.devControls.setGameActive(true);
    this.game.devControls.setPaused(false);
    this.createHud();
    if (this.startingBoss) this.startBoss();
    else this.startCombatRoom();
  }

  togglePaused() {
    this.isTuningPaused = !this.isTuningPaused;
    this.game.devControls.setPaused(this.isTuningPaused);
    if (this.isTuningPaused) this.scene.pause();
    else this.scene.resume();
  }

  createTextures() {
    if (this.textures.exists("player")) return;
    const create = (key, color, size, border = 0xffffff) => {
      const g = this.add.graphics();
      g.fillStyle(border, 1).fillRect(0, 0, size, size);
      g.fillStyle(color, 1).fillRect(3, 3, size - 6, size - 6);
      g.fillStyle(0xffffff, 0.24).fillRect(5, 5, Math.max(3, size / 3), Math.max(3, size / 3));
      g.generateTexture(key, size, size);
      g.destroy();
    };
    create("player", 0xf8c555, 24, 0xfff3b4);
    create("bullet", 0xfff3b4, 8, 0xf8c555);
    create("enemyBullet", 0xe05b7d, 9, 0xffc1cf);
    create("boss", 0x8e3f71, 68, 0xf8c555);
    Object.entries(MONSTER_VISUALS).forEach(([key, stat]) => create(key, stat.color, stat.size * 2, 0x301d48));
  }

  drawFloor(time = this.time.now) {
    if (!this.spaceTimeGrid) this.spaceTimeGrid = this.add.graphics().setDepth(-1);
    const floor = this.spaceTimeGrid;
    const projectileWarps = [...(this.projectiles || []), ...(this.enemyProjectiles || [])].map((projectile) => ({
      x: projectile.sprite.x,
      y: projectile.sprite.y,
      vx: projectile.vx,
      vy: projectile.vy,
      radius: 78,
      strength: 13,
    }));
    this.warpEvents = this.warpEvents.filter((event) => time - event.startedAt < event.duration);
    floor.clear();

    const drawGridLine = (vertical) => {
      floor.beginPath();
      const fixed = vertical ? ARENA.left + 16 : ARENA.top + 16;
      const limit = vertical ? ARENA.right : ARENA.bottom;
      for (let line = fixed; line < limit; line += 32) {
        for (let progress = vertical ? ARENA.top : ARENA.left; progress <= (vertical ? ARENA.bottom : ARENA.right); progress += 12) {
          const point = this.warpGridPoint(vertical ? line : progress, vertical ? progress : line, projectileWarps, time);
          if (progress === (vertical ? ARENA.top : ARENA.left)) floor.moveTo(point.x, point.y);
          else floor.lineTo(point.x, point.y);
        }
        floor.strokePath();
        floor.beginPath();
      }
    };

    floor.lineStyle(1, 0x765a9c, 0.5);
    drawGridLine(true);
    floor.lineStyle(1, 0x5a4380, 0.44);
    drawGridLine(false);
    this.drawDeathWarps(floor, time);
  }

  warpGridPoint(x, y, projectileWarps, time) {
    let warpedX = x;
    let warpedY = y;
    const warpPoint = (source, mode = "projectile") => {
      const dx = x - source.x;
      const dy = y - source.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance >= source.radius) return;
      const falloff = ((source.radius - distance) / source.radius) ** 2;
      const pull = source.strength * falloff;
      warpedX -= (dx / distance) * pull;
      warpedY -= (dy / distance) * pull;
      if (mode === "projectile") {
        const speed = Math.hypot(source.vx, source.vy) || 1;
        const normalX = -source.vy / speed;
        const normalY = source.vx / speed;
        const trail = Phaser.Math.Clamp((source.radius * 0.45 - (dx * source.vx + dy * source.vy) / speed) / source.radius, 0, 1);
        const side = Math.sign(dx * normalX + dy * normalY);
        warpedX -= normalX * side * pull * trail * 0.8;
        warpedY -= normalY * side * pull * trail * 0.8;
      }
    };

    projectileWarps.forEach((source) => warpPoint(source));
    this.warpEvents.forEach((event) => {
      const age = (time - event.startedAt) / event.duration;
      const dx = x - event.x;
      const dy = y - event.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (age < 0.3) {
        warpPoint({ ...event, radius: 150, strength: event.strength * (1 - age / 0.3) * 3.4 }, "singularity");
        return;
      }
      const ringRadius = 24 + (age - 0.3) * 430;
      const ringWidth = 52;
      const ringForce = Math.max(0, 1 - Math.abs(distance - ringRadius) / ringWidth) ** 2 * event.strength * (1 - age) * 2.5;
      warpedX += (dx / distance) * ringForce;
      warpedY += (dy / distance) * ringForce;
      warpedX += (-dy / distance) * ringForce * 0.42;
      warpedY += (dx / distance) * ringForce * 0.42;
    });
    return { x: warpedX, y: warpedY };
  }

  drawDeathWarps(floor, time) {
    this.warpEvents.forEach((event) => {
      const age = (time - event.startedAt) / event.duration;
      if (age < 0.3) {
        const radius = 10 + age * 90;
        floor.fillStyle(0x08050f, (1 - age / 0.3) * 0.78);
        floor.fillCircle(event.x, event.y, radius);
        floor.lineStyle(2, 0xb984de, (1 - age / 0.3) * 0.8);
        floor.strokeCircle(event.x, event.y, radius + 6);
        return;
      }
      const radius = 24 + (age - 0.3) * 430;
      floor.lineStyle(2, 0xe3b0eb, (1 - age) * 0.8);
      floor.strokeCircle(event.x, event.y, radius);
      floor.lineStyle(1, 0x8f6fca, (1 - age) * 0.6);
      floor.strokeCircle(event.x, event.y, Math.max(0, radius - 13));
    });
  }

  createHud() {
    this.hud = {
      title: this.add.text(28, 19, "", { fontFamily: "Courier New", fontSize: "20px", fontStyle: "bold", color: "#f8c555" }).setDepth(10),
      health: this.add.text(515, 20, "", { fontFamily: "Courier New", fontSize: "17px", color: "#f8efcf" }).setDepth(10),
      dash: this.add.text(820, 20, "", { fontFamily: "Courier New", fontSize: "17px", color: "#e3b0eb" }).setDepth(10),
      status: this.add.text(WIDTH / 2, 55, "", { fontFamily: "Courier New", fontSize: "15px", color: "#b8a5d6" }).setOrigin(0.5).setDepth(10),
    };
  }

  startCombatRoom() {
    this.isBossFight = false;
    this.wave = 0;
    this.wavesInRoom = this.isEndless ? this.tuning.wavesPerRoom + 1 + Math.floor(this.endlessRoom / 3) : this.tuning.wavesPerRoom + Math.floor(this.room / 3);
    this.nextWaveAt = this.time.now + this.tuning.waveStartDelay;
    this.onslaughtPending = false;
    this.onslaughtTriggered = false;
    this.showMessage(this.isEndless ? `ENDLESS ROOM ${this.endlessRoom}` : `COMBAT ROOM ${this.room}`, "#78c850");
  }

  spawnWave() {
    this.wave += 1;
    this.nextWaveAt = 0;
    const scale = this.isEndless ? this.endlessRoom : this.room;
    const densityBonus = this.isEndless ? Math.floor(scale * 0.7)
      : scale >= 9 ? 4 : scale >= 6 ? 3 : scale >= 3 ? 2 : 0;
    const count = this.scaledEnemyCount(this.tuning.waveBaseCount + this.wave + Math.floor(scale * this.tuning.waveScaleFactor) + densityBonus);
    for (let i = 0; i < count; i += 1) {
      this.spawnMonster(Phaser.Utils.Array.GetRandom(this.unlockedMonsterTypes(scale)), scale);
    }
    this.game.sfx.play(160, 0.1, "sawtooth", 0.05);
    this.showMessage(`WAVE ${this.wave} / ${this.wavesInRoom}`, "#e3b0eb");
  }

  unlockedMonsterTypes(scale) {
    if (this.isEndless) return ["chaser", "ranged", "splitter", "tank", "orbiter", "ambusher", "summoner"];
    const types = ["chaser"];
    if (scale >= 2) types.push("ranged");
    if (scale >= 4) types.push("splitter");
    if (scale >= 5) types.push("orbiter");
    if (scale >= 6) types.push("tank", "ambusher");
    if (scale >= 8) types.push("summoner");
    return types;
  }

  scaledEnemyCount(count) {
    return scaledEnemyCount(count, this.hardMode);
  }

  enemyHealthScale() {
    return hardModeScale("health", this.hardMode) * this.tuning.enemyHealthMultiplier;
  }

  enemyDamageScale() {
    return hardModeScale("damage", this.hardMode) * this.tuning.enemyDamageMultiplier;
  }

  enemySpeedScale() {
    return hardModeScale("speed", this.hardMode) * this.tuning.enemySpeedMultiplier;
  }

  spawnOnslaught() {
    this.onslaughtPending = false;
    this.onslaughtTriggered = true;
    const compositions = {
      4: { chaser: 19, ranged: 9 },
      7: { chaser: 17, ranged: 10, splitter: 9, orbiter: 3, ambusher: 3 },
      10: { chaser: 14, ranged: 5, splitter: 24, tank: 4, orbiter: 3, ambusher: 3, summoner: 3 },
    };
    const composition = compositions[this.room];
    Object.entries(composition).forEach(([type, count]) => {
      for (let i = 0; i < this.scaledEnemyCount(count); i += 1) this.spawnMonster(type, this.room);
    });
    this.game.sfx.play(95, 0.45, "sawtooth", 0.11);
    this.showMessage("ONSLAUGHT!", "#e05b7d");
  }

  spawnMonster(type, scale = 1, x, y) {
    const stat = MONSTER_VISUALS[type];
    const side = Phaser.Math.Between(0, 3);
    const position = x === undefined
      ? side === 0 ? { x: ARENA.left + 12, y: Phaser.Math.Between(ARENA.top, ARENA.bottom) }
        : side === 1 ? { x: ARENA.right - 12, y: Phaser.Math.Between(ARENA.top, ARENA.bottom) }
          : side === 2 ? { x: Phaser.Math.Between(ARENA.left, ARENA.right), y: ARENA.top + 12 }
            : { x: Phaser.Math.Between(ARENA.left, ARENA.right), y: ARENA.bottom - 12 }
      : { x, y };
    this.showSpawnIndicator(type, position, stat.size, () => this.createMonster(type, scale, position));
  }

  createMonster(type, scale, position) {
    const stat = MONSTER_VISUALS[type];
    const sprite = this.add.sprite(position.x, position.y, type).setDepth(3);
    const statScale = this.enemyHealthScale();
    const damageScale = this.enemyDamageScale();
    const movementScale = this.enemySpeedScale();
    const endlessScale = (this.isEndless ? 1 + (scale * 0.13) : 1 + (scale * 0.06)) * statScale;
    const speedScale = this.isEndless
      ? 1 + Math.min(0.8, scale * 0.08)
      : 1 + Math.min(0.4, Math.max(0, scale - 2) * 0.05);
    this.monsters.push({
      type, sprite, health: this.tuning[`${type}Health`] * endlessScale, maxHealth: this.tuning[`${type}Health`] * endlessScale,
      speed: this.tuning[`${type}Speed`] * speedScale * movementScale, damage: this.tuning[`${type}Damage`] * (1 + scale * 0.05) * damageScale,
      size: stat.size, scale, shotAt: this.time.now + Phaser.Math.Between(400, 1200),
      orbitDirection: Phaser.Math.Between(0, 1) ? 1 : -1,
      movementUntil: this.time.now + Phaser.Math.Between(350, 850),
      dead: false,
    });
  }

  showSpawnIndicator(type, position, size, onComplete) {
    const stat = type === "boss" ? { color: 0x8e3f71, size } : MONSTER_VISUALS[type];
    const marker = this.add.sprite(position.x, position.y, type).setDepth(2).setAlpha(0.32).setScale(1.45);
    const ring = this.add.circle(position.x, position.y, size + 11, stat.color, 0.1)
      .setStrokeStyle(2, stat.color, 0.85)
      .setDepth(2);
    this.pendingSpawnCount += 1;
    this.tweens.add({
      targets: [marker, ring],
      alpha: 0.9,
      scale: 1.12,
      duration: 225,
      yoyo: true,
    });
    this.time.delayedCall(450, () => {
      marker.destroy();
      ring.destroy();
      this.pendingSpawnCount -= 1;
      onComplete();
    });
  }

  startBoss() {
    this.isBossFight = true;
    this.showMessage("THE MEGA BOSS AWAKENS", "#e05b7d");
    const position = { x: WIDTH / 2, y: ARENA.top + 86 };
    this.showSpawnIndicator("boss", position, 34, () => {
      const sprite = this.add.sprite(position.x, position.y, "boss").setDepth(3);
      const boss = {
        type: "boss", sprite, health: this.tuning.bossHealth * this.enemyHealthScale(), maxHealth: this.tuning.bossHealth * this.enemyHealthScale(),
        speed: this.tuning.bossSpeed * this.enemySpeedScale(), size: 34, damage: this.tuning.bossDamage * this.enemyDamageScale(),
        phase: 1, shotAt: this.time.now + 1000, summonAt: this.time.now + 3200, dead: false,
      };
      this.monsters.push(boss);
      this.game.sfx.play(82, 0.45, "sawtooth", 0.1);
    });
  }

  update(time, delta) {
    if (this.upgradeOpen) return;
    this.updatePlayer(time, delta);
    this.updateBlaster(time);
    this.drawFloor(time);
    this.updateProjectiles(delta);
    this.updateMonsters(time, delta);
    this.updateEnemyProjectiles(delta);
    this.updateRoomState(time);
    this.updateHud();
  }

  updatePlayer(time, delta) {
    const move = new Phaser.Math.Vector2(
      (this.wasd.D.isDown || this.cursorKeys.right.isDown ? 1 : 0) - (this.wasd.A.isDown || this.cursorKeys.left.isDown ? 1 : 0),
      (this.wasd.S.isDown || this.cursorKeys.down.isDown ? 1 : 0) - (this.wasd.W.isDown || this.cursorKeys.up.isDown ? 1 : 0),
    );
    if (move.lengthSq() > 0) this.player.dashDirection = move.normalize().clone();
    if (Phaser.Input.Keyboard.JustDown(this.wasd.SHIFT) && time >= this.player.dashReadyAt) {
      this.player.dashUntil = time + this.tuning.dashDuration;
      this.player.dashReadyAt = time + this.tuning.dashCooldown;
      this.player.invulnerableUntil = this.player.dashUntil;
      this.game.sfx.play(520, 0.08, "square", 0.06);
    }
    const speed = time < this.player.dashUntil ? this.tuning.dashSpeed : this.tuning.playerSpeed;
    const direction = time < this.player.dashUntil ? this.player.dashDirection : move.normalize();
    this.player.x = Phaser.Math.Clamp(this.player.x + direction.x * speed * delta / 1000, ARENA.left + 13, ARENA.right - 13);
    this.player.y = Phaser.Math.Clamp(this.player.y + direction.y * speed * delta / 1000, ARENA.top + 13, ARENA.bottom - 13);
    this.player.setAlpha(time < this.player.invulnerableUntil ? 0.55 + Math.sin(time / 40) * 0.35 : 1);
  }

  updateBlaster(time) {
    if (time - this.lastShotAt < Math.max(this.tuning.blasterMinimumInterval, this.tuning.blasterInterval - this.modifiers.rate * this.tuning.fireRateUpgrade)) return;
    this.lastShotAt = time;
    const pointer = this.input.activePointer;
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
    const count = 1 + this.modifiers.count;
    const spread = Phaser.Math.DegToRad(Math.min(44, Math.max(0, count - 1) * this.tuning.spreadPerProjectile));
    for (let i = 0; i < count; i += 1) {
      const angle = count === 1 ? baseAngle : baseAngle - spread / 2 + spread * (i / (count - 1));
      const sprite = this.add.sprite(this.player.x, this.player.y, "bullet").setDepth(2);
      this.projectiles.push({
        sprite, vx: Math.cos(angle) * (this.tuning.projectileSpeed + this.modifiers.speed * this.tuning.projectileSpeedUpgrade), vy: Math.sin(angle) * (this.tuning.projectileSpeed + this.modifiers.speed * this.tuning.projectileSpeedUpgrade),
        damage: this.tuning.projectileDamage + this.modifiers.damage * this.tuning.projectileDamageUpgrade, pierce: this.modifiers.pierce, hit: new Set(),
      });
    }
    this.game.sfx.play(650 + this.modifiers.rate * 8, 0.035, "square", 0.018);
  }

  updateProjectiles(delta) {
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.sprite.x += projectile.vx * delta / 1000;
      projectile.sprite.y += projectile.vy * delta / 1000;
      if (!this.inArena(projectile.sprite.x, projectile.sprite.y)) {
        projectile.sprite.destroy();
        return false;
      }
      for (const monster of this.monsters) {
        if (monster.dead || projectile.hit.has(monster)) continue;
        if (Phaser.Math.Distance.Between(projectile.sprite.x, projectile.sprite.y, monster.sprite.x, monster.sprite.y) < monster.size + 5) {
          projectile.hit.add(monster);
          this.damageMonster(monster, projectile.damage);
          projectile.pierce -= 1;
          if (projectile.pierce < 0) {
            projectile.sprite.destroy();
            return false;
          }
        }
      }
      return true;
    });
  }

  updateMonsters(time, delta) {
    for (const monster of this.monsters) {
      if (monster.dead) continue;
      const distance = Phaser.Math.Distance.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y);
      if (monster.type === "ranged") this.updateRanged(monster, distance, time, delta);
      else if (monster.type === "boss") this.updateBoss(monster, time, delta);
      else if (monster.type === "chaser") this.updateChaser(monster, time, delta);
      else if (monster.type === "tank") this.updateTank(monster, time, delta);
      else if (monster.type === "splitter") this.updateSplitter(monster, time, delta);
      else if (monster.type === "mini") this.updateMini(monster, time, delta);
      else if (monster.type === "orbiter") this.updateOrbiter(monster, time, delta);
      else if (monster.type === "ambusher") this.updateAmbusher(monster, time, delta);
      else if (monster.type === "summoner") this.updateSummoner(monster, time, delta);
      if (monster.type !== "ranged" && monster.type !== "boss" && distance < monster.size + 12) this.damagePlayer(monster.damage, time);
      if (monster.type === "boss" && distance < 50) this.damagePlayer(monster.damage, time);
    }
    this.monsters = this.monsters.filter((monster) => !monster.dead);
  }

  updateChaser(monster, time, delta) {
    if (time >= monster.movementUntil) {
      monster.charging = !monster.charging;
      monster.movementUntil = time + (monster.charging ? 420 : Phaser.Math.Between(450, 800));
    }
    if (monster.charging) {
      this.moveToward(monster, this.player, delta, 1.65);
      return;
    }
    const angle = Phaser.Math.Angle.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y)
      + monster.orbitDirection * 1.05;
    this.moveAtAngle(monster, angle, delta, 0.86);
  }

  updateRanged(monster, distance, time, delta) {
    if (monster.aiming) {
      if (time >= monster.aimUntil) {
        this.fireEnemyProjectile(monster, this.normalProjectileSpeed(monster), Phaser.Math.FloatBetween(-0.14, 0.14));
        monster.aiming = false;
        monster.sprite.clearTint();
      }
      return;
    }
    if (distance > 285) this.moveToward(monster, this.player, delta, 0.85);
    else if (distance < 205) this.moveAway(monster, this.player, delta, 0.9);
    else {
      const angle = Phaser.Math.Angle.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y)
        + monster.orbitDirection * Math.PI / 2;
      this.moveAtAngle(monster, angle, delta, 0.82);
    }
    if (time >= monster.shotAt) {
      monster.aiming = true;
      monster.aimUntil = time + 350;
      monster.shotAt = time + 1350;
      monster.sprite.setTint(0xffffff);
    }
  }

  updateTank(monster, time, delta) {
    if (monster.rushUntil && time < monster.rushUntil) {
      this.moveAtAngle(monster, monster.rushAngle, delta, 4.2);
      return;
    }
    if (monster.windupUntil && time < monster.windupUntil) return;
    if (monster.windupUntil) {
      monster.windupUntil = 0;
      monster.rushUntil = time + 360;
      monster.rushAngle = Phaser.Math.Angle.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y);
      monster.sprite.clearTint();
      return;
    }
    if (time >= monster.movementUntil) {
      monster.windupUntil = time + 400;
      monster.movementUntil = time + 2100;
      monster.sprite.setTint(0xffd1d6);
      return;
    }
    this.moveToward(monster, this.player, delta, 0.48);
  }

  updateSplitter(monster, time, delta) {
    updateSplitterMovement(
      monster,
      this.player,
      time,
      () => Phaser.Math.FloatBetween(-1.35, 1.35),
      () => Phaser.Math.Between(90, 190),
    );
    this.moveAtAngle(monster, monster.zigZagAngle, delta, 2.25);
  }

  updateMini(monster, time, delta) {
    const angle = Phaser.Math.Angle.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y)
      + Math.sin(time / 85 + monster.sprite.x) * 0.34;
    this.moveAtAngle(monster, angle, delta, 1.08);
  }

  updateOrbiter(monster, time, delta) {
    const distance = Phaser.Math.Distance.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y);
    if (distance > 265) this.moveToward(monster, this.player, delta, 0.78);
    else if (distance < 185) this.moveAway(monster, this.player, delta, 0.72);
    else {
      const angle = Phaser.Math.Angle.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y)
        + monster.orbitDirection * Math.PI / 2;
      this.moveAtAngle(monster, angle, delta, 0.78);
    }
    if (time >= monster.shotAt) {
      this.fireRotatingRing(monster, 10, this.normalProjectileSpeed(monster) * 0.72);
      monster.shotAt = time + 2000;
    }
  }

  updateAmbusher(monster, time, delta) {
    if (monster.pounceUntil && time < monster.pounceUntil) {
      this.moveAtAngle(monster, monster.pounceAngle, delta, 4.8);
      return;
    }
    if (monster.tellUntil && time < monster.tellUntil) return;
    if (monster.tellUntil) {
      monster.tellUntil = 0;
      monster.pounceUntil = time + 300;
      monster.sprite.clearTint();
      return;
    }
    if (!monster.flankTarget) {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, monster.sprite.x, monster.sprite.y)
        + monster.orbitDirection * 1.35;
      monster.flankTarget = {
        x: Phaser.Math.Clamp(this.player.x + Math.cos(angle) * 210, ARENA.left + 18, ARENA.right - 18),
        y: Phaser.Math.Clamp(this.player.y + Math.sin(angle) * 210, ARENA.top + 18, ARENA.bottom - 18),
      };
      return;
    }
    if (Phaser.Math.Distance.Between(monster.sprite.x, monster.sprite.y, monster.flankTarget.x, monster.flankTarget.y) < 24) {
      monster.flankTarget = null;
      monster.pounceAngle = Phaser.Math.Angle.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y);
      monster.tellUntil = time + 500;
      monster.sprite.setTint(0xfff0bb);
      return;
    }
    this.moveToward(monster, monster.flankTarget, delta, 1.1);
  }

  updateSummoner(monster, time, delta) {
    const distance = Phaser.Math.Distance.Between(monster.sprite.x, monster.sprite.y, this.player.x, this.player.y);
    if (distance > 320) this.moveToward(monster, this.player, delta, 0.58);
    else if (distance < 235) this.moveAway(monster, this.player, delta, 0.62);
    if (time >= monster.shotAt) {
      for (let i = 0; i < 3; i += 1) {
        const angle = (Math.PI * 2 * i) / 3 + Phaser.Math.FloatBetween(-0.25, 0.25);
        this.spawnMonster("mini", monster.scale, monster.sprite.x + Math.cos(angle) * 24, monster.sprite.y + Math.sin(angle) * 24);
      }
      monster.shotAt = time + 3000;
      this.game.sfx.play(380, 0.08, "triangle", 0.045);
    }
  }

  updateBoss(boss, time, delta) {
    const healthRatio = boss.health / boss.maxHealth;
    const phase = healthRatio <= 0.33 ? 3 : healthRatio <= 0.66 ? 2 : 1;
    if (phase !== boss.phase) {
      boss.phase = phase;
      boss.movementUntil = time;
      this.showMessage(`MEGA BOSS: PHASE ${phase}`, "#f8c555");
      this.game.sfx.play(110 + phase * 45, 0.24, "sawtooth", 0.08);
    }
    this.updateBossMovement(boss, time, delta);
    if (time >= boss.shotAt) {
      const shots = this.scaledEnemyCount(boss.phase + 2);
      for (let i = 0; i < shots; i += 1) this.fireEnemyProjectile(boss, this.tuning.bossProjectileSpeed + boss.phase * 35, (i - (shots - 1) / 2) * 0.16);
      if (boss.phase >= 2) this.fireRadial(boss, this.scaledEnemyCount(boss.phase === 3 ? 12 : 8), this.tuning.bossProjectileSpeed * 0.7);
      boss.shotAt = time + this.tuning.bossFireInterval - boss.phase * 180;
    }
    if (time >= boss.summonAt) {
      for (let i = 0; i < this.scaledEnemyCount(boss.phase); i += 1) this.spawnMonster("chaser", 8 + boss.phase, boss.sprite.x + Phaser.Math.Between(-70, 70), boss.sprite.y + 42);
      boss.summonAt = time + this.tuning.bossSummonInterval - boss.phase * 300;
    }
  }

  updateBossMovement(boss, time, delta) {
    if (boss.phase === 1) {
      const target = {
        x: WIDTH / 2 + Math.cos(time / 690) * 235,
        y: (ARENA.top + ARENA.bottom) / 2 + Math.sin(time / 690) * 175,
      };
      this.moveToward(boss, target, delta);
      return;
    }
    if (boss.phase === 2) {
      if (!boss.crossTarget || time >= boss.movementUntil) {
        boss.crossTarget = { x: boss.sprite.x < WIDTH / 2 ? ARENA.right - 70 : ARENA.left + 70, y: Phaser.Math.Between(ARENA.top + 70, ARENA.bottom - 70) };
        boss.movementUntil = time + 950;
        boss.crossStartAt = time + 350;
        boss.sprite.setTint(0xffe0a0);
      }
      if (time < boss.crossStartAt) return;
      boss.sprite.clearTint();
      this.moveToward(boss, boss.crossTarget, delta, 3.1);
      return;
    }
    if (time >= boss.movementUntil) {
      boss.orbitDirection = Phaser.Math.Between(0, 1) ? 1 : -1;
      boss.movementUntil = time + Phaser.Math.Between(280, 700);
    }
    const target = {
      x: WIDTH / 2 + Math.cos(time / 230 * boss.orbitDirection) * 245,
      y: (ARENA.top + ARENA.bottom) / 2 + Math.sin(time / 230 * boss.orbitDirection) * 185,
    };
    this.moveToward(boss, target, delta, 3.2);
  }

  moveToward(entity, target, delta, multiplier = 1) {
    const angle = Phaser.Math.Angle.Between(entity.sprite.x, entity.sprite.y, target.x, target.y);
    this.moveAtAngle(entity, angle, delta, multiplier);
  }

  moveAway(entity, target, delta, multiplier = 1) {
    const angle = Phaser.Math.Angle.Between(target.x, target.y, entity.sprite.x, entity.sprite.y);
    this.moveAtAngle(entity, angle, delta, multiplier);
  }

  moveAtAngle(entity, angle, delta, multiplier = 1) {
    entity.sprite.x = Phaser.Math.Clamp(entity.sprite.x + Math.cos(angle) * entity.speed * multiplier * delta / 1000, ARENA.left + entity.size, ARENA.right - entity.size);
    entity.sprite.y = Phaser.Math.Clamp(entity.sprite.y + Math.sin(angle) * entity.speed * multiplier * delta / 1000, ARENA.top + entity.size, ARENA.bottom - entity.size);
  }

  fireEnemyProjectile(source, speed, angleOffset = 0) {
    const angle = Phaser.Math.Angle.Between(source.sprite.x, source.sprite.y, this.player.x, this.player.y) + angleOffset;
    const sprite = this.add.sprite(source.sprite.x, source.sprite.y, "enemyBullet").setDepth(2);
    const projectileSpeed = speed * this.enemySpeedScale();
    const damage = source.type === "boss" ? (12 + source.phase * 3) * this.enemyDamageScale() : source.damage;
    this.enemyProjectiles.push({ sprite, vx: Math.cos(angle) * projectileSpeed, vy: Math.sin(angle) * projectileSpeed, damage });
  }

  normalProjectileSpeed(monster) {
    const progression = this.isEndless
      ? 1 + Math.min(0.7, monster.scale * 0.06)
      : 1 + Math.max(0, monster.scale - 2) * 0.03;
    return this.tuning.rangedProjectileSpeed * progression;
  }

  fireRotatingRing(source, count, speed) {
    source.ringAngle = (source.ringAngle || 0) + Math.PI / 7;
    const projectileSpeed = speed * this.enemySpeedScale();
    for (let i = 0; i < count; i += 1) {
      const angle = source.ringAngle + (Math.PI * 2 * i) / count;
      const sprite = this.add.sprite(source.sprite.x, source.sprite.y, "enemyBullet").setDepth(2);
      this.enemyProjectiles.push({ sprite, vx: Math.cos(angle) * projectileSpeed, vy: Math.sin(angle) * projectileSpeed, damage: source.damage });
    }
  }

  fireRadial(source, count, speed = 190) {
    const projectileSpeed = speed * this.enemySpeedScale();
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const sprite = this.add.sprite(source.sprite.x, source.sprite.y, "enemyBullet").setDepth(2);
      this.enemyProjectiles.push({
        sprite,
        vx: Math.cos(angle) * projectileSpeed,
        vy: Math.sin(angle) * projectileSpeed,
        damage: (11 + source.phase * 2) * this.enemyDamageScale(),
      });
    }
  }

  updateEnemyProjectiles(delta) {
    this.enemyProjectiles = this.enemyProjectiles.filter((projectile) => {
      projectile.sprite.x += projectile.vx * delta / 1000;
      projectile.sprite.y += projectile.vy * delta / 1000;
      if (!this.inArena(projectile.sprite.x, projectile.sprite.y)) {
        projectile.sprite.destroy();
        return false;
      }
      if (Phaser.Math.Distance.Between(projectile.sprite.x, projectile.sprite.y, this.player.x, this.player.y) < 17) {
        this.damagePlayer(projectile.damage, this.time.now);
        projectile.sprite.destroy();
        return false;
      }
      return true;
    });
  }

  damageMonster(monster, damage) {
    monster.health -= damage;
    monster.sprite.setTintFill(0xffffff);
    this.time.delayedCall(45, () => monster.sprite?.clearTint());
    this.game.sfx.play(monster.type === "boss" ? 140 : 280, 0.035, "square", 0.015);
    if (monster.health <= 0) this.killMonster(monster);
  }

  killMonster(monster) {
    if (monster.dead) return;
    monster.dead = true;
    const x = monster.sprite.x;
    const y = monster.sprite.y;
    this.warpEvents.push({
      x,
      y,
      startedAt: this.time.now,
      duration: monster.type === "boss" ? 1450 : 760,
      strength: monster.type === "boss" ? 42 : Math.max(10, monster.size * 0.9),
    });
    this.tweens.add({ targets: monster.sprite, alpha: 0, scale: 2, duration: 120, onComplete: () => monster.sprite.destroy() });
    this.game.sfx.play(monster.type === "boss" ? 70 : 180, monster.type === "boss" ? 0.45 : 0.08, "sawtooth", monster.type === "boss" ? 0.1 : 0.04);
    if (monster.type === "splitter") {
      this.spawnMonster("mini", this.isEndless ? this.endlessRoom : this.room, x - 10, y);
      this.spawnMonster("mini", this.isEndless ? this.endlessRoom : this.room, x + 10, y);
    }
    if (monster.type === "boss") {
      this.isBossFight = false;
      this.monsters
        .filter((other) => other !== monster && !other.dead)
        .forEach((other) => {
          other.dead = true;
          other.sprite.destroy();
        });
      this.enemyProjectiles.forEach((projectile) => projectile.sprite.destroy());
      this.enemyProjectiles = [];
      this.isEndless = true;
      this.endlessRoom = 1;
      this.showMessage("MEGA BOSS DEFEATED - ENDLESS BEGINS", "#78c850");
      this.time.delayedCall(1000, () => this.startCombatRoom());
    }
  }

  damagePlayer(damage, time) {
    if (time < this.player.invulnerableUntil) return;
    this.player.health = Math.max(0, this.player.health - damage);
    this.player.invulnerableUntil = time + 500;
    this.player.setTint(0xe05b7d);
    this.time.delayedCall(90, () => this.player?.clearTint());
    this.game.sfx.play(105, 0.12, "sawtooth", 0.07);
    if (this.player.health <= 0) this.endRun();
  }

  updateRoomState(time) {
    if (this.isBossFight || this.upgradeOpen || this.monsters.length > 0 || this.pendingSpawnCount > 0) return;
    if (this.wave === 0 && time >= this.nextWaveAt) {
      this.spawnWave();
      return;
    }
    if (this.onslaughtPending) {
      if (time >= this.nextWaveAt) this.spawnOnslaught();
      return;
    }
    if (!this.isEndless && !this.onslaughtTriggered && this.wave === 1 && [4, 7, 10].includes(this.room)) {
      this.onslaughtPending = true;
      this.nextWaveAt = time + 1250;
      this.showMessage("ONSLAUGHT INCOMING", "#e05b7d");
      return;
    }
    if (this.wave > 0 && this.wave < this.wavesInRoom) {
      if (!this.nextWaveAt) {
        this.nextWaveAt = time + this.tuning.waveDelay;
        this.showMessage("NEXT WAVE INCOMING", "#e3b0eb");
      } else if (time >= this.nextWaveAt) {
        this.spawnWave();
      }
      return;
    }
    if (this.wave >= this.wavesInRoom) {
      this.wave = -1;
      this.player.health = this.player.maxHealth;
      this.game.sfx.play(720, 0.16, "triangle", 0.07);
      this.openUpgrades();
    }
  }

  openUpgrades() {
    this.upgradeOpen = true;
    const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x10091c, 0.92).setDepth(30);
    const title = this.add.text(WIDTH / 2, 116, "CHOOSE 2 BLASTER MODIFIERS", {
      fontFamily: "Courier New", fontSize: "27px", fontStyle: "bold", color: "#f8c555",
    }).setOrigin(0.5).setDepth(31);
    const choices = [
      ["damage", "DAMAGE", `+${this.tuning.projectileDamageUpgrade} projectile damage`],
      ["rate", "FIRE RATE", `-${this.tuning.fireRateUpgrade}ms between shots`],
      ["count", "PROJECTILE COUNT", "+1 projectile per shot"],
      ["speed", "PROJECTILE SPEED", `+${this.tuning.projectileSpeedUpgrade} projectile speed`],
      ["pierce", "PIERCE", "+1 monster pierced"],
    ];
    const buttons = [];
    let selected = 0;
    const pick = (key) => {
      this.modifiers[key] += 1;
      selected += 1;
      this.game.sfx.play(780, 0.08, "triangle", 0.06);
      if (selected === 2) {
        buttons.forEach((button) => button.destroy());
        overlay.destroy();
        title.destroy();
        this.upgradeOpen = false;
        if (this.isEndless) {
          this.endlessRoom += 1;
          this.startCombatRoom();
        } else if (this.room === 10) {
          this.time.delayedCall(650, () => this.startBoss());
        } else {
          this.room += 1;
          this.startCombatRoom();
        }
      }
    };
    choices.forEach(([key, label, detail], index) => {
      const y = 184 + index * 72;
      const button = this.add.rectangle(WIDTH / 2, y, 500, 56, 0x35234f).setStrokeStyle(2, 0x8e6cab).setDepth(31).setInteractive({ useHandCursor: true });
      const text = this.add.text(WIDTH / 2, y - 10, label, { fontFamily: "Courier New", fontSize: "19px", fontStyle: "bold", color: "#f8efcf" }).setOrigin(0.5).setDepth(32);
      const description = this.add.text(WIDTH / 2, y + 13, detail, { fontFamily: "Courier New", fontSize: "13px", color: "#b8a5d6" }).setOrigin(0.5).setDepth(32);
      button.on("pointerover", () => button.setFillStyle(0x593a78));
      button.on("pointerout", () => button.setFillStyle(0x35234f));
      button.on("pointerdown", () => pick(key));
      buttons.push(button, text, description);
    });
  }

  updateHud() {
    const area = this.isBossFight ? "MEGA BOSS" : this.isEndless ? `ENDLESS ${this.endlessRoom}` : `ROOM ${this.room}`;
    const title = this.hardMode ? `HARD MODE: ${area}` : area;
    this.hud.title.setText(title);
    this.hud.health.setText(`HP ${Math.ceil(this.player.health)} / ${this.player.maxHealth}`);
    this.hud.dash.setText(this.time.now >= this.player.dashReadyAt ? "DASH READY" : "DASH ...");
    const alive = this.monsters.filter((monster) => !monster.dead).length;
    this.hud.status.setText(this.isBossFight ? "Defeat the three-phase Mega Boss" : alive ? `${alive} monsters remaining` : "");
  }

  showMessage(text, color) {
    this.hud?.status.setText(text).setColor(color);
    this.tweens.add({ targets: this.hud.status, alpha: 0.25, duration: 900, yoyo: true, onComplete: () => this.hud.status.setAlpha(1) });
  }

  inArena(x, y) {
    return x >= ARENA.left && x <= ARENA.right && y >= ARENA.top && y <= ARENA.bottom;
  }

  endRun() {
    this.scene.start("summary", {
      room: this.isEndless ? `Endless ${this.endlessRoom}` : this.room,
      bossDefeated: this.isEndless,
      elapsed: Math.floor((this.time.now - this.runStartedAt) / 1000),
      modifiers: this.modifiers,
      hardMode: this.hardMode,
    });
  }
}

class SummaryScene extends Phaser.Scene {
  constructor() {
    super("summary");
  }

  init(data) {
    this.run = data;
  }

  create() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x130d23);
    const time = `${Math.floor(this.run.elapsed / 60)}:${String(this.run.elapsed % 60).padStart(2, "0")}`;
    const modifiers = Object.entries(this.run.modifiers).filter(([, value]) => value > 0)
      .map(([key, value]) => `${key.toUpperCase()} x${value}`).join("\n") || "No modifiers selected";
    this.add.text(WIDTH / 2, 100, "RUN ENDED", {
      fontFamily: "Courier New", fontSize: "50px", fontStyle: "bold", color: "#e05b7d",
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 205, `MODE: ${this.run.hardMode ? "HARD" : "BASELINE"}\nROOM REACHED: ${this.run.room}\nMEGA BOSS: ${this.run.bossDefeated ? "DEFEATED" : "NOT REACHED"}\nTIME: ${time}`, {
      fontFamily: "Courier New", fontSize: "21px", color: "#f8efcf", align: "center", lineSpacing: 11,
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 362, `BLASTER BUILD\n${modifiers}`, {
      fontFamily: "Courier New", fontSize: "16px", color: "#b8a5d6", align: "center", lineSpacing: 7,
    }).setOrigin(0.5);
    const restart = this.add.text(WIDTH / 2, 544, "CHOOSE A NEW RUN", {
      fontFamily: "Courier New", fontSize: "25px", fontStyle: "bold", color: "#78c850", backgroundColor: "#25153c", padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    restart.on("pointerdown", () => this.scene.start("start"));
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: "game",
  pixelArt: true,
  backgroundColor: "#130d23",
  scene: [StartScene, GameScene, SummaryScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  callbacks: {
    postBoot: (game) => {
      game.sfx = new Sfx();
      game.tuning = loadTuning();
      game.devControls = createDeveloperControls(game.tuning, () => {
        game.scene.getScene("game")?.togglePaused();
      });
      game.devControls.setGameActive(false);
    },
  },
});
