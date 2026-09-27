(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const canvas = $("#game-canvas");
  const ctx = canvas.getContext("2d");
  const W = 1280;
  const H = 720;
  const WORLD_W = 3000;
  const LANE_TOP = 355;
  const LANE_BOTTOM = 590;
  const keys = new Set();

  const imageSources = {
    background: "assets/arena-brutalist.webp",
    su7Car: "assets/su7-car.webp",
    su7Transform2: "assets/su7-transform-2.webp",
    su7Transform3: "assets/su7-transform-3.webp",
    su7Transform4: "assets/su7-transform-4.webp",
    su7Transform5: "assets/su7-transform-5.webp",
    su7Robot: "assets/su7-robot.webp",
    su7Punch: "assets/su7-action-punch.webp",
    su7Kick: "assets/su7-action-kick.webp",
    su7Gun1: "assets/su7-action-gun-1.webp",
    su7Gun2: "assets/su7-action-gun-2.webp",
    su7Gun3: "assets/su7-action-gun-3.webp",
    yu7Car: "assets/yu7-car-v2.webp",
    yu7Transform2: "assets/yu7-transform-2.webp",
    yu7Transform3: "assets/yu7-transform-3.webp",
    yu7Transform4: "assets/yu7-transform-4.webp",
    yu7Transform5: "assets/yu7-transform-5.webp",
    yu7Robot: "assets/yu7-robot-v2.webp",
    yu7Punch: "assets/yu7-action-punch.webp",
    yu7Kick: "assets/yu7-action-kick.webp",
    yu7Gun1: "assets/yu7-action-gun-1.webp",
    yu7Gun2: "assets/yu7-action-gun-2.webp",
    yu7Gun3: "assets/yu7-action-gun-3.webp",
    passatCar: "assets/minion-passat-car.webp",
    passatTransform3: "assets/minion-passat-transform-3.webp",
    passatTransform4: "assets/minion-passat-transform-4.webp",
    passatRobot: "assets/minion-passat-robot.webp",
    passatAttack: "assets/minion-passat-attack.webp",
    sylphyCar: "assets/minion-sylphy-car.webp",
    sylphyTransform3: "assets/minion-sylphy-transform-3.webp",
    sylphyTransform4: "assets/minion-sylphy-transform-4.webp",
    sylphyRobot: "assets/minion-sylphy-robot.webp",
    sylphyAttack: "assets/minion-sylphy-attack.webp",
    corollaCar: "assets/minion-corolla-car.webp",
    corollaTransform3: "assets/minion-corolla-transform-3.webp",
    corollaTransform4: "assets/minion-corolla-transform-4.webp",
    corollaRobot: "assets/minion-corolla-robot.webp",
    corollaAttack: "assets/minion-corolla-attack.webp",
    camryCar: "assets/minion-camry-car.webp",
    camryTransform3: "assets/minion-camry-transform-3.webp",
    camryTransform4: "assets/minion-camry-transform-4.webp",
    camryRobot: "assets/minion-camry-robot.webp",
    camryAttack: "assets/minion-camry-attack.webp",
    boss911Car: "assets/boss-911-car.webp",
    boss911Transform2: "assets/boss-911-transform-2.webp",
    boss911Transform3: "assets/boss-911-transform-3.webp",
    boss911Transform4: "assets/boss-911-transform-4.webp",
    boss911Transform5: "assets/boss-911-transform-5.webp",
    boss911Robot: "assets/boss-911-robot.webp",
    bossFuvCar: "assets/puro-car.webp",
    bossFuvTransform2: "assets/boss-fuv-transform-2.webp",
    bossFuvTransform3: "assets/boss-fuv-transform-3.webp",
    bossFuvTransform4: "assets/boss-fuv-transform-4.webp",
    bossFuvTransform5: "assets/boss-fuv-transform-5.webp",
    bossFuvRobot: "assets/puro-robot.webp",
    runSu7Passat: "assets/run-su7-passat.webp",
    runYu7Sylphy: "assets/run-yu7-sylphy.webp",
    runCorollaCamry: "assets/run-corolla-camry.webp",
    runBosses: "assets/run-bosses.webp",
  };
  const images = Object.fromEntries(Object.entries(imageSources).map(([name, src]) => {
    const image = new Image();
    image.src = src;
    return [name, image];
  }));

  // Exact subject bounds exclude neighbouring poses and keep every run frame
  // anchored to the same feet baseline. The renderer normalizes height only.
  const runFrameBounds = {
    runSu7Passat: [
      [[19, 9, 435, 364], [518, 44, 764, 364], [794, 15, 1107, 364], [1139, 7, 1526, 363], [1541, 46, 1859, 364], [1873, 15, 2164, 364]],
      [[13, 374, 429, 714], [485, 403, 747, 714], [754, 381, 1090, 714], [1122, 363, 1487, 705], [1540, 404, 1837, 714], [1881, 375, 2153, 714]],
    ],
    runYu7Sylphy: [
      [[8, 9, 371, 366], [445, 29, 711, 366], [791, 10, 1053, 366], [1074, 7, 1495, 366], [1522, 25, 1792, 366], [1828, 9, 2161, 366]],
      [[29, 406, 359, 717], [448, 426, 722, 717], [789, 406, 1073, 716], [1111, 406, 1479, 715], [1553, 422, 1785, 717], [1844, 406, 2151, 717]],
    ],
    runCorollaCamry: [
      [[22, 8, 321, 348], [398, 23, 668, 341], [772, 9, 1063, 346], [1133, 8, 1458, 342], [1527, 28, 1798, 346], [1895, 8, 2164, 344]],
      [[18, 360, 356, 713], [398, 386, 715, 713], [764, 360, 1094, 713], [1125, 360, 1475, 713], [1517, 388, 1836, 713], [1892, 360, 2171, 713]],
    ],
    runBosses: [
      [[25, 13, 401, 359], [447, 27, 724, 358], [758, 12, 1067, 358], [1077, 4, 1476, 350], [1507, 20, 1767, 357], [1826, 23, 2160, 352]],
      [[20, 360, 404, 718], [447, 378, 734, 718], [758, 369, 1073, 718], [1092, 360, 1495, 714], [1502, 371, 1792, 718], [1828, 361, 2171, 718]],
    ],
  };

  const heroes = {
    su7: {
      name: "SU7 ULTRA", hp: 145, speed: 275, power: 1, car: "su7Car", robot: "su7Robot", color: "#ffd02c", runSheet: "runSu7Passat", runRow: 0, runArtFacing: 1,
      transform: ["su7Car", "su7Transform2", "su7Transform3", "su7Transform4", "su7Transform5", "su7Robot"],
      actionArt: {
        punch: "su7Punch", kick: "su7Kick", guns: ["su7Gun1", "su7Gun2", "su7Gun3"],
        muzzles: [[105, 240], [120, 225], [125, 220]],
      },
      transformFacing: [1, 1, 1, 1, 1, 1], robotArtFacing: 1,
    },
    yu7: {
      name: "YU7", hp: 185, speed: 225, power: 1.16, car: "yu7Car", robot: "yu7Robot", color: "#159252", runSheet: "runYu7Sylphy", runRow: 0, runArtFacing: 1,
      transform: ["yu7Car", "yu7Transform2", "yu7Transform3", "yu7Transform4", "yu7Transform5", "yu7Robot"],
      actionArt: {
        punch: "yu7Punch", kick: "yu7Kick", guns: ["yu7Gun1", "yu7Gun2", "yu7Gun3"],
        muzzles: [[135, 235], [180, 225], [235, 220]],
      },
      transformFacing: [1, 1, 1, 1, 1, 1], robotArtFacing: 1,
    },
  };
  const minionModels = [
    {
      id: "passat", name: "PASSAT", color: "#24496f", hp: 58, speed: 180, damage: 12,
      car: "passatCar", robot: "passatRobot", attackArt: "passatAttack",
      transform: ["passatCar", "passatCar", "passatTransform3", "passatTransform4", "passatRobot", "passatRobot"],
      artFacing: -1, runSheet: "runSu7Passat", runRow: 1, runArtFacing: 1, size: [154, 205], attackSize: [190, 205],
    },
    {
      id: "sylphy", name: "SYLPHY", color: "#e6e1d5", hp: 49, speed: 215, damage: 11,
      car: "sylphyCar", robot: "sylphyRobot", attackArt: "sylphyAttack",
      transform: ["sylphyCar", "sylphyCar", "sylphyTransform3", "sylphyTransform4", "sylphyRobot", "sylphyRobot"],
      artFacing: -1, runSheet: "runYu7Sylphy", runRow: 1, runArtFacing: 1, size: [170, 205], attackSize: [235, 205],
    },
    {
      id: "corolla", name: "COROLLA", color: "#a9afb4", hp: 54, speed: 198, damage: 12,
      car: "corollaCar", robot: "corollaRobot", attackArt: "corollaAttack",
      transform: ["corollaCar", "corollaCar", "corollaTransform3", "corollaTransform4", "corollaRobot", "corollaRobot"],
      artFacing: -1, runSheet: "runCorollaCamry", runRow: 0, runArtFacing: 1, size: [170, 205], attackSize: [205, 205],
    },
    {
      id: "camry", name: "CAMRY HEAVY", color: "#7e2528", hp: 78, speed: 162, damage: 20,
      car: "camryCar", robot: "camryRobot", attackArt: "camryAttack",
      transform: ["camryCar", "camryCar", "camryTransform3", "camryTransform4", "camryRobot", "camryRobot"],
      artFacing: -1, runSheet: "runCorollaCamry", runRow: 1, runArtFacing: 1, size: [185, 220], attackSize: [210, 220],
    },
  ];
  const clips = {
    drive: [4, 10, true], transform: [6, 5.8, false], minionTransform: [6, 7.5, false],
    idle: [4, 5, true], walk: [6, 10, true], punch: [5, 14, false], kick: [6, 12, false],
    shoot: [5, 12, false], enemyAttack: [5, 10, false], hurt: [3, 12, false], ko: [6, 8, false],
  };
  const levelThresholds = [0, 70, 175, 320];
  const weaponNames = ["声波冲击", "脉冲手枪", "双联冲锋枪", "千匹能量步枪"];

  let game = null;
  let raf = 0;
  let lastTime = 0;
  let assetsReady = false;

  function makeAnim(name = "idle") { return { name, time: 0, frame: 0, finished: false }; }
  function setAnim(actor, name, force = false) {
    if (!force && actor.anim.name === name) return;
    actor.anim = makeAnim(name);
  }
  function advanceAnim(actor, dt) {
    const [frames, fps, loop] = clips[actor.anim.name] || clips.idle;
    const actionSpeed = actor.kind === "player" && ["punch", "kick", "shoot"].includes(actor.anim.name) ? actor.attackSpeed : 1;
    actor.anim.time += dt * actionSpeed;
    const raw = Math.floor(actor.anim.time * fps);
    actor.anim.frame = loop ? raw % frames : Math.min(frames - 1, raw);
    actor.anim.finished = !loop && raw >= frames;
  }
  function loadAssets() {
    if (assetsReady) return Promise.resolve();
    return Promise.all(Object.values(images).map((image) => {
      if (image.complete && image.naturalWidth) return Promise.resolve();
      return new Promise((resolve, reject) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", reject, { once: true });
      });
    })).then(() => { assetsReady = true; });
  }

  function makePlayer(id) {
    const base = heroes[id];
    return {
      id, ...base, kind: "player", maxHp: base.hp, x: -260, y: 515, facing: 1,
      hp: base.hp, level: 1, xp: 0, weapon: 0, speedBoost: 1, attackSpeed: 1, regen: 0, combo: 0,
      comboTimer: 0, invulnerable: 0, punchReady: 0, kickReady: 0, skillReady: 0,
      action: null, anim: makeAnim("drive"),
    };
  }

  async function startGame(id) {
    const buttons = $$(".hero-option");
    const copy = $("#select-status");
    const original = copy.textContent;
    buttons.forEach((button) => { button.disabled = true; });
    copy.textContent = "LOADING CHARACTER SYSTEM...";
    try { await loadAssets(); }
    catch {
      copy.textContent = "素材加载失败，请刷新页面后重试。";
      buttons.forEach((button) => { button.disabled = false; });
      return;
    }
    copy.textContent = original;
    buttons.forEach((button) => { button.disabled = false; });
    $("#select-screen").classList.remove("active");
    $("#play-screen").classList.add("active");
    $("#upgrade-panel").classList.remove("show");
    $("#end-panel").classList.remove("show");
    game = {
      player: makePlayer(id), enemies: [], projectiles: [], particles: [], impacts: [], phase: "hero-entry",
      phaseTime: 0, wave: 0, camera: 0, gate: 1050, paused: false, cleared: false,
      shake: 0, hitStop: 0, upgradeMode: null, waitingForBossUpgrade: false,
    };
    setMission("六段变形启动");
    updateHud();
    canvas.focus();
    cancelAnimationFrame(raf);
    lastTime = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function loop(now) {
    const dt = Math.min(.034, (now - lastTime) / 1000 || 0);
    lastTime = now;
    if (game && !game.paused && !game.cleared) update(dt);
    if (game) draw();
    raf = requestAnimationFrame(loop);
  }

  function update(dt) {
    const p = game.player;
    game.phaseTime += dt;
    game.shake = Math.max(0, game.shake - dt);
    if (game.hitStop > 0) { game.hitStop -= dt; return; }
    p.invulnerable = Math.max(0, p.invulnerable - dt);
    p.punchReady = Math.max(0, p.punchReady - dt);
    p.kickReady = Math.max(0, p.kickReady - dt);
    p.skillReady = Math.max(0, p.skillReady - dt);
    p.comboTimer = Math.max(0, p.comboTimer - dt);
    if (!p.comboTimer) p.combo = 0;
    if (p.regen > 0 && p.hp > 0 && game.phase === "fight") p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);

    if (game.phase === "hero-entry") updateHeroEntry(dt);
    else if (game.phase === "wave-entry" || game.phase === "boss-entry") updateScriptedEntry(dt);
    else {
      updatePlayer(dt);
      updateEnemies(dt);
      updateProjectiles(dt);
      game.camera = clamp(lerp(game.camera, p.x - W * .38, .08), 0, WORLD_W - W);
      checkWaveClear();
    }
    updateParticles(dt);
    updateHud();
  }

  function updateHeroEntry(dt) {
    const p = game.player;
    if (game.phaseTime < 1.05) {
      p.x = lerp(-250, 285, easeOut(game.phaseTime / 1.05));
      setAnim(p, "drive");
      advanceAnim(p, dt);
      return;
    }
    if (p.anim.name !== "transform") setAnim(p, "transform", true);
    advanceAnim(p, dt);
    if (p.anim.finished) {
      p.x = 270;
      setAnim(p, "idle", true);
      startWave(1);
    }
  }

  function updatePlayer(dt) {
    const p = game.player;
    if (p.action) {
      advanceAnim(p, dt);
      processPlayerAction();
      if (p.anim.finished) {
        if (p.action.type === "ko") return;
        p.action = null;
        setAnim(p, "idle", true);
      }
      return;
    }
    let dx = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
    let dy = (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0);
    if (dx && dy) { dx *= .707; dy *= .707; }
    if (dx) p.facing = Math.sign(dx);
    p.x = clamp(p.x + dx * p.speed * p.speedBoost * dt, 140, Math.min(WORLD_W - 140, game.gate));
    p.y = clamp(p.y + dy * p.speed * p.speedBoost * .68 * dt, LANE_TOP, LANE_BOTTOM);
    setAnim(p, dx || dy ? "walk" : "idle");
    advanceAnim(p, dt);
  }

  function startWave(number) {
    game.wave = number;
    game.phaseTime = 0;
    game.enemies = [];
    if (number === 1) {
      game.gate = 1120;
      game.phase = "wave-entry";
      game.enemies.push(makeMinion(0, 720, 470, 380), makeMinion(1, 865, 545, 520), makeMinion(2, 1010, 410, 650));
      setMission("WAVE 1 · 通勤军团正在变形");
    } else if (number === 2) {
      game.gate = 2050;
      game.phase = "wave-entry";
      game.enemies.push(makeMinion(3, 1450, 430, 360), makeMinion(0, 1600, 545, 520), makeMinion(2, 1760, 460, 660), makeMinion(1, 1920, 560, 780));
      setMission("WAVE 2 · 第二车队入场");
    } else {
      game.gate = WORLD_W - 70;
      game.phase = "boss-entry";
      game.enemies.push(makeBoss("911", 2460, 440), makeBoss("fuv", 2710, 560));
      setMission("FINAL · LEGACY 双王入场");
      showWord("BOSS 来了");
    }
  }

  function makeMinion(index, targetX, y, entryOffset) {
    const model = minionModels[index];
    return {
      ...model, kind: "minion", hp: model.hp, maxHp: model.hp, x: targetX + entryOffset,
      startX: targetX + entryOffset, targetX, y, facing: -1, cooldown: .7 + Math.random(),
      vx: 0, hit: 0, defeated: false, removed: false, xp: 28, action: null,
      anim: makeAnim("drive"), introVisible: true,
    };
  }

  function makeBoss(type, targetX, y) {
    const is911 = type === "911";
    const hp = is911 ? 285 : 355;
    return {
      kind: "boss", bossType: type, name: is911 ? "911 LEGACY" : "PUROSANGUE FUV",
      color: is911 ? "#44464a" : "#8d1825", hp, maxHp: hp, speed: is911 ? 204 : 153,
      damage: is911 ? 27 : 35, car: is911 ? "boss911Car" : "bossFuvCar",
      robot: is911 ? "boss911Robot" : "bossFuvRobot", runSheet: "runBosses", runRow: is911 ? 0 : 1, runArtFacing: 1, x: targetX + 720,
      transform: is911
        ? ["boss911Car", "boss911Transform2", "boss911Transform3", "boss911Transform4", "boss911Transform5", "boss911Robot"]
        : ["bossFuvCar", "bossFuvTransform2", "bossFuvTransform3", "bossFuvTransform4", "bossFuvTransform5", "bossFuvRobot"],
      transformFacing: is911 ? [-1, -1, -1, -1, -1, -1] : [1, -1, -1, -1, -1, 1],
      robotArtFacing: is911 ? -1 : 1,
      startX: targetX + 720, targetX, y, facing: -1, cooldown: 1.1, vx: 0,
      hit: 0, defeated: false, removed: false, xp: 100, action: null,
      anim: makeAnim("drive"), introVisible: is911,
    };
  }

  function updateScriptedEntry(dt) {
    if (game.phase === "wave-entry") {
      const t = easeOut(game.phaseTime / 1.05);
      for (const enemy of game.enemies) {
        if (game.phaseTime < 1.05) {
          enemy.x = lerp(enemy.startX, enemy.targetX, t);
          advanceAnim(enemy, dt);
        } else {
          if (enemy.anim.name !== "minionTransform") setAnim(enemy, "minionTransform", true);
          advanceAnim(enemy, dt);
        }
      }
      if (game.phaseTime > 1.95) {
        game.enemies.forEach((enemy) => setAnim(enemy, "idle", true));
        game.phase = "fight";
        setMission(`WAVE ${game.wave} · 击败 ${game.enemies.length} 台汽车人`);
      }
      return;
    }

    const [boss911, bossFuv] = game.enemies;
    if (game.phaseTime < 1) {
      boss911.x = lerp(boss911.startX, boss911.targetX, easeOut(game.phaseTime));
      advanceAnim(boss911, dt);
    } else if (game.phaseTime < 2.35) {
      if (boss911.anim.name !== "transform") setAnim(boss911, "transform", true);
      advanceAnim(boss911, dt);
    } else if (game.phaseTime < 3.35) {
      if (boss911.anim.name !== "idle") setAnim(boss911, "idle", true);
      advanceAnim(boss911, dt);
      bossFuv.introVisible = true;
      bossFuv.x = lerp(bossFuv.startX, bossFuv.targetX, easeOut(game.phaseTime - 2.35));
      advanceAnim(bossFuv, dt);
    } else if (game.phaseTime < 4.7) {
      advanceAnim(boss911, dt);
      if (bossFuv.anim.name !== "transform") setAnim(bossFuv, "transform", true);
      advanceAnim(bossFuv, dt);
    } else {
      game.enemies.forEach((enemy) => setAnim(enemy, "idle", true));
      game.phase = "fight";
      setMission("FINAL · 击破 911 与 PUROSANGUE");
      showWord("双王开战");
    }
    game.camera = clamp(lerp(game.camera, 1740, .045), 0, WORLD_W - W);
  }

  function updateEnemies(dt) {
    const p = game.player;
    for (const enemy of game.enemies) {
      if (enemy.removed) continue;
      enemy.hit = Math.max(0, enemy.hit - dt);
      if (enemy.defeated) {
        advanceAnim(enemy, dt);
        if (enemy.anim.finished) enemy.removed = true;
        continue;
      }
      enemy.cooldown -= dt;
      enemy.x += enemy.vx * dt;
      enemy.vx *= Math.pow(.002, dt);
      enemy.facing = p.x < enemy.x ? -1 : 1;
      if (enemy.action) {
        advanceAnim(enemy, dt);
        if (enemy.action.type === "attack" && !enemy.action.hitDone && enemy.anim.frame >= 2) {
          enemy.action.hitDone = true;
          if (laneClose(enemy, p, enemy.kind === "boss" ? 92 : 68) && intersects(attackRect(enemy, "enemy"), hurtbox(p))) hurtPlayer(enemy.damage, enemy.facing);
        }
        if (enemy.anim.finished) { enemy.action = null; setAnim(enemy, "idle", true); }
        continue;
      }
      const xGap = p.x - enemy.x;
      const yGap = p.y - enemy.y;
      const range = enemy.kind === "boss" ? 145 : 92;
      if (Math.abs(xGap) > range || Math.abs(yGap) > (enemy.kind === "boss" ? 86 : 64)) {
        const distance = Math.hypot(xGap, yGap) || 1;
        enemy.x += xGap / distance * enemy.speed * dt;
        enemy.y = clamp(enemy.y + yGap / distance * enemy.speed * .62 * dt, LANE_TOP, LANE_BOTTOM);
        setAnim(enemy, "walk");
      } else if (enemy.cooldown <= 0) {
        enemy.cooldown = enemy.kind === "boss" ? .82 + Math.random() * .42 : 1.05 + Math.random() * .65;
        enemy.action = { type: "attack", hitDone: false };
        setAnim(enemy, "enemyAttack", true);
      } else setAnim(enemy, "idle");
      advanceAnim(enemy, dt);
    }
  }

  function canAct() { return game && game.phase === "fight" && !game.paused && !game.cleared && !game.player.action; }
  function melee(type) {
    if (!canAct()) return;
    const p = game.player;
    const kick = type === "kick";
    if ((kick ? p.kickReady : p.punchReady) > 0) return;
    if (kick) p.kickReady = .5 / p.attackSpeed; else p.punchReady = .26 / p.attackSpeed;
    p.action = { type, hitTargets: new Set(), calledMiss: false };
    setAnim(p, type, true);
  }
  function useSkill() {
    if (!canAct()) return;
    const p = game.player;
    if (p.skillReady > 0) return;
    p.skillReady = (p.weapon === 0 ? 1.55 : p.weapon === 3 ? 1.2 : .72) / p.attackSpeed;
    p.action = { type: p.weapon ? "shoot" : "sonic", hitTargets: new Set(), fired: false, calledMiss: false };
    setAnim(p, p.weapon ? "shoot" : "punch", true);
    if (!p.weapon) showWord("ARE YOU OK?");
  }

  function processPlayerAction() {
    const p = game.player;
    const action = p.action;
    if (!action || action.type === "hurt" || action.type === "ko") return;
    if (action.type === "shoot") {
      if (!action.fired && p.anim.frame >= 2) { action.fired = true; fireWeapon(); }
      return;
    }
    const active = action.type === "kick" ? p.anim.frame >= 3 && p.anim.frame <= 4 : p.anim.frame === 2;
    if (!active) return;
    const box = attackRect(p, action.type === "kick" ? "kick" : "punch");
    let hits = 0;
    for (const enemy of game.enemies) {
      if (enemy.defeated || action.hitTargets.has(enemy)) continue;
      const lane = action.type === "kick" ? 84 : action.type === "sonic" ? 130 : 72;
      if (laneClose(p, enemy, lane) && intersects(box, hurtbox(enemy))) {
        action.hitTargets.add(enemy);
        const base = action.type === "sonic" ? 34 : action.type === "kick" ? 29 : 17;
        damageEnemy(enemy, Math.round(base * p.power), p.facing, action.type === "kick" ? 72 : 38);
        hits += 1;
      }
    }
    if (!hits && !action.calledMiss) action.calledMiss = true;
  }

  function fireWeapon() {
    const p = game.player;
    const count = p.weapon >= 2 ? 2 : 1;
    const [muzzleX, muzzleY] = p.actionArt.muzzles[p.weapon - 1];
    for (let i = 0; i < count; i += 1) {
      game.projectiles.push({
        x: p.x + p.facing * muzzleX, y: p.y - muzzleY + (i - (count - 1) / 2) * 24,
        vx: p.facing * (p.weapon === 3 ? 570 : 800), life: 1.65,
        width: p.weapon === 3 ? 64 : 42, height: p.weapon === 3 ? 28 : 18,
        damage: Math.round((p.weapon === 3 ? 58 : p.weapon === 2 ? 28 : 25) * p.power),
        explosive: p.weapon === 3, pierce: p.weapon === 2, hit: new Set(),
      });
    }
    burst(p.x + p.facing * muzzleX, p.y - muzzleY, p.color, 12);
  }

  function hurtbox(actor) {
    const width = actor.kind === "boss" ? 170 : actor.kind === "minion" ? Math.max(94, actor.size[0] * .62) : 112;
    const height = actor.kind === "boss" ? 345 : actor.kind === "minion" ? actor.size[1] * .92 : 285;
    return { x: actor.x - width / 2, y: actor.y - height, width, height };
  }
  function attackRect(actor, type) {
    const boss = actor.kind === "boss";
    const reach = type === "kick" ? 156 : type === "punch" ? 124 : boss ? 195 : 118;
    const height = type === "kick" ? 150 : boss ? 245 : 175;
    const top = actor.y - (type === "kick" ? 178 : boss ? 300 : 240);
    return { x: actor.facing > 0 ? actor.x + 24 : actor.x - 24 - reach, y: top, width: reach, height };
  }
  function laneClose(a, b, reach) { return Math.abs(a.y - b.y) <= reach; }
  function intersects(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }

  function updateProjectiles(dt) {
    for (const shot of game.projectiles) {
      shot.x += shot.vx * dt;
      shot.life -= dt;
      const box = { x: shot.x - shot.width / 2, y: shot.y - shot.height / 2, width: shot.width, height: shot.height };
      for (const enemy of game.enemies) {
        if (enemy.defeated || shot.hit.has(enemy) || !intersects(box, hurtbox(enemy))) continue;
        shot.hit.add(enemy);
        damageEnemy(enemy, shot.damage, Math.sign(shot.vx), shot.explosive ? 65 : 28);
        if (shot.explosive) {
          for (const other of game.enemies) if (!other.defeated && other !== enemy && Math.hypot(other.x - enemy.x, other.y - enemy.y) < 150) damageEnemy(other, Math.round(shot.damage * .55), Math.sign(shot.vx), 35);
          burst(enemy.x, enemy.y - 100, "#ffd02c", 18);
        }
        if (!shot.pierce) shot.life = 0;
      }
    }
    game.projectiles = game.projectiles.filter((shot) => shot.life > 0);
  }

  function damageEnemy(enemy, amount, direction, knockback) {
    if (enemy.defeated) return;
    enemy.hp = Math.max(0, enemy.hp - amount);
    enemy.hit = .16;
    enemy.vx += direction * knockback * (enemy.kind === "boss" ? .45 : 1);
    game.shake = enemy.kind === "boss" ? .14 : .08;
    game.hitStop = enemy.kind === "boss" ? .055 : .035;
    game.player.combo += 1;
    game.player.comboTimer = 2.1;
    burst(enemy.x, enemy.y - 100, "#f3e5ca", 7);
    impact(enemy.x - direction * 18, enemy.y - 118, enemy.kind === "boss" ? 76 : 54, enemy.kind === "boss" ? "#ef493b" : "#f6e7c9");
    if (enemy.hp <= 0) {
      enemy.defeated = true;
      enemy.action = null;
      setAnim(enemy, "ko", true);
      game.player.xp += enemy.xp;
      burst(enemy.x, enemy.y - 70, enemy.color, enemy.kind === "boss" ? 28 : 15);
      checkLevelUp();
    } else {
      enemy.action = { type: "hurt" };
      setAnim(enemy, "hurt", true);
    }
  }

  function hurtPlayer(amount, direction) {
    const p = game.player;
    if (p.invulnerable > 0) return;
    p.hp = Math.max(0, p.hp - amount);
    p.invulnerable = .62;
    p.x = clamp(p.x + direction * 42, 140, game.gate);
    p.combo = 0;
    p.action = { type: p.hp <= 0 ? "ko" : "hurt" };
    setAnim(p, p.action.type, true);
    game.shake = .22;
    game.hitStop = .05;
    impact(p.x - direction * 22, p.y - 120, 62, "#ef493b");
    burst(p.x, p.y - 100, "#bd3038", 12);
    if (p.hp <= 0) setTimeout(() => finish(false), 650);
  }

  function updateParticles(dt) {
    for (const particle of game.particles) {
      particle.x += particle.vx * dt; particle.y += particle.vy * dt;
      particle.vy += 180 * dt; particle.life -= dt;
    }
    game.particles = game.particles.filter((particle) => particle.life > 0);
    for (const flash of game.impacts) flash.life -= dt;
    game.impacts = game.impacts.filter((flash) => flash.life > 0);
  }

  function checkLevelUp() {
    const p = game.player;
    if (game.wave >= 3 || game.phase === "boss-entry" || p.level >= 4 || p.xp < levelThresholds[p.level]) return;
    p.level += 1;
    p.hp = Math.min(p.maxHp, p.hp + 25);
    openUpgrade("level");
    updateHud();
  }
  function openUpgrade(mode) {
    const p = game.player;
    game.upgradeMode = mode;
    game.paused = true;
    $("#upgrade-code").textContent = mode === "boss" ? "FINAL EVOLUTION" : "AUGMENT SELECT";
    $("#upgrade-title").textContent = mode === "boss" ? "决战前进化" : "选择强化";
    $("#weapon-next").textContent = p.weapon < 3 ? `进化：${weaponNames[p.weapon + 1]}` : "武器满级 · 火力 +16%";
    $("#upgrade-panel").classList.add("show");
  }
  function chooseUpgrade(type) {
    if (!game) return;
    const p = game.player;
    if (type === "agility") { p.speedBoost += .18; p.attackSpeed += .2; }
    if (type === "defense") { p.maxHp += 45; p.hp = Math.min(p.maxHp, p.hp + 60); p.regen += 1.25; }
    if (type === "attack") {
      if (p.weapon < 3) p.weapon += 1;
      else p.power += .16;
    }
    const mode = game.upgradeMode;
    game.upgradeMode = null;
    $("#upgrade-panel").classList.remove("show");
    showWord(type === "attack" ? "武装进化" : type === "defense" ? "防御强化" : "敏捷强化");
    if (mode === "boss") {
      game.waitingForBossUpgrade = false;
      game.paused = false;
      startWave(3);
    } else if (game.waitingForBossUpgrade) openUpgrade("boss");
    else game.paused = false;
    canvas.focus();
    updateHud();
  }
  function checkWaveClear() {
    if (!game.enemies.length || game.enemies.some((enemy) => !enemy.removed)) return;
    if (game.wave === 1) startWave(2);
    else if (game.wave === 2) {
      if (game.waitingForBossUpgrade) return;
      game.waitingForBossUpgrade = true;
      if (!game.paused) openUpgrade("boss");
    }
    else finish(true);
  }
  function finish(won) {
    if (!game || game.cleared) return;
    game.cleared = true;
    const resultCharacter = $("#end-character");
    resultCharacter.src = won ? "assets/lei-jun-win.webp" : "assets/lei-jun-lose.webp";
    resultCharacter.alt = won ? "卡通雷军开心地竖起大拇指" : "卡通雷军失落地流泪";
    $("#end-title").textContent = won ? "胜利" : "失败";
    $("#end-panel").classList.add("show");
  }

  function draw() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (game.shake) ctx.translate((Math.random() - .5) * 13, (Math.random() - .5) * 9);
    drawBackground();
    drawWorldDecor();
    drawActors();
    drawProjectiles();
    drawImpacts();
    drawParticles();
    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = "#130d08"; ctx.fillRect(0, 0, W, H);
    const image = images.background;
    if (image.complete && image.naturalWidth) {
      const tileWidth = W * 1.08;
      const tileHeight = H * 1.06;
      const offset = -((game.camera * .22) % tileWidth) - 42;
      const yShift = -30 + (game.player.y - 475) * .035;
      ctx.globalAlpha = .94;
      ctx.drawImage(image, offset, yShift, tileWidth, tileHeight);
      ctx.drawImage(image, offset + tileWidth, yShift, tileWidth, tileHeight);
      ctx.globalAlpha = 1;
    }
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "rgba(12,8,5,.08)"); gradient.addColorStop(.58, "rgba(12,8,5,.16)"); gradient.addColorStop(1, "rgba(4,3,2,.72)");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(20,13,8,.78)"; ctx.fillRect(0, 590, W, 130);
  }
  function drawWorldDecor() {
    ctx.save(); ctx.translate(-game.camera, 0); ctx.strokeStyle = "rgba(242,162,74,.23)"; ctx.lineWidth = 2;
    for (let x = 0; x <= WORLD_W; x += 120) { ctx.beginPath(); ctx.moveTo(x, 590); ctx.lineTo(x + 70, 720); ctx.stroke(); }
    for (let y = 610; y < 720; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_W, y); ctx.stroke(); }
    ctx.font = "900 22px Courier New";
    for (const [x, text] of [[620, "COPY LANE"], [1450, "PRICE DISTRICT"], [2420, "LEGACY TOWER"]]) {
      ctx.fillStyle = "rgba(11,8,5,.78)"; ctx.fillRect(x - 18, 280, 230, 46); ctx.strokeStyle = "#c98b52"; ctx.strokeRect(x - 18, 280, 230, 46); ctx.fillStyle = "#f3e5ca"; ctx.fillText(text, x, 311);
    }
    if (game.phase === "fight" && game.enemies.some((enemy) => !enemy.removed)) {
      ctx.fillStyle = "rgba(242,162,74,.13)"; ctx.fillRect(game.gate + 18, 300, 12, 330); ctx.strokeStyle = "rgba(242,162,74,.8)";
      for (let y = 300; y < 630; y += 28) { ctx.beginPath(); ctx.moveTo(game.gate, y); ctx.lineTo(game.gate + 48, y + 24); ctx.stroke(); }
    }
    ctx.restore();
  }

  function drawActors() {
    const actors = [game.player, ...game.enemies.filter((enemy) => enemy.introVisible !== false && !enemy.removed)].sort((a, b) => a.y - b.y);
    actors.forEach(drawActor);
  }
  function drawActor(actor) {
    const x = actor.x - game.camera;
    if (actor.anim.name === "drive") {
      drawShadow(x, actor.y + 7, actor.kind === "boss" ? 220 : actor.kind === "minion" ? 125 : 175);
      const artFacing = actor.kind === "minion" ? actor.artFacing : actor.transformFacing?.[0] || 1;
      drawCarImage(
        images[actor.car], x, actor.y,
        actor.kind === "boss" ? 430 : actor.kind === "minion" ? 250 : 365,
        actor.kind === "boss" ? 205 : actor.kind === "minion" ? 125 : 180,
        actor.facing / artFacing, actor.anim.frame, actor.facing,
      );
      return;
    }
    if (actor.anim.name === "transform" || actor.anim.name === "minionTransform") { drawTransformation(actor, x); return; }
    drawShadow(x, actor.y + 8, actor.kind === "boss" ? 210 : actor.kind === "minion" ? 105 : 155);
    if (actor.anim.name === "walk" && actor.runSheet) drawRunRobot(actor, x, actor.y);
    else if (actor.kind === "minion") drawMinionRobot(actor, x, actor.y);
    else drawWholeRobot(actor, x, actor.y);
    if (actor.kind !== "player" && !actor.defeated) drawEnemyBar(actor, x, actor.y - (actor.kind === "boss" ? 390 : actor.size[1] + 18), actor.kind === "boss" ? 230 : 128);
  }

  function drawTransformation(actor, x) {
    const boss = actor.kind === "boss";
    drawShadow(x, actor.y + 8, boss ? 210 : actor.kind === "minion" ? 110 : 160);
    if (actor.kind === "minion") {
      const frame = clamp(actor.anim.frame, 0, 5);
      const image = images[actor.transform[frame]];
      const carFrame = frame <= 1;
      const landing = frame === 4 ? 10 : 0;
      drawContainedImageBottom(
        image, x, actor.y - (carFrame ? frame * 18 : 0) + landing,
        carFrame ? 250 : frame <= 3 ? 235 : actor.size[0],
        carFrame ? 125 : frame <= 3 ? 220 : actor.size[1],
        actor.facing / actor.artFacing,
      );
      if (frame === 5) burstOnce(actor, actor.x, actor.y - 35, actor.color, 10);
      return;
    }

    const frame = clamp(actor.anim.frame, 0, 5);
    const image = images[actor.transform[frame]];
    const artFacing = actor.transformFacing[frame] || 1;
    const landing = frame === 4 ? 12 : 0;
    drawContainedImageBottom(image, x, actor.y + landing, boss ? 480 : 370, boss ? 445 : 335, actor.facing / artFacing);
    if (frame === 5) burstOnce(actor, actor.x, actor.y - 35, actor.color, 10);
  }

  function drawCarImage(image, x, bottom, width, height, flip, frame, movementFacing) {
    drawImageBottom(image, x, bottom + (frame % 2 ? 2 : 0), width, height, flip);
    ctx.save(); ctx.strokeStyle = "rgba(243,229,202,.45)"; ctx.lineWidth = 5;
    for (let i = 0; i < 4; i += 1) { ctx.beginPath(); ctx.moveTo(x - movementFacing * (width / 2 + 30 + i * 34), bottom - 35 - i * 7); ctx.lineTo(x - movementFacing * (width / 2 + 110 + i * 42), bottom - 35 - i * 7); ctx.stroke(); }
    ctx.restore();
  }
  function poseFor(actor) {
    const frame = actor.anim.frame;
    const frames = (clips[actor.anim.name] || clips.idle)[0];
    const phase = frame / Math.max(1, frames - 1);
    const pose = { bob: 0, lean: 0, frontArm: .05, backArm: -.05, frontLeg: 0, backLeg: 0, drop: 0, rotation: 0 };
    if (actor.anim.name === "idle") { pose.bob = Math.sin(frame * Math.PI / 2) * 3; pose.frontArm += Math.sin(frame * Math.PI / 2) * .06; }
    if (actor.anim.name === "walk") { const s = Math.sin(phase * Math.PI * 2); pose.bob = Math.abs(s) * 7; pose.frontArm = s * .42; pose.backArm = -s * .42; pose.frontLeg = -s * .34; pose.backLeg = s * .34; }
    if (actor.anim.name === "punch" || actor.anim.name === "enemyAttack") { const s = Math.sin(phase * Math.PI); pose.frontArm = -s * 1.3; pose.backArm = .35; pose.lean = s * .12; }
    if (actor.anim.name === "kick") { const s = Math.sin(phase * Math.PI); pose.frontLeg = -s * 1.25; pose.backArm = -s * .4; pose.lean = -s * .12; }
    if (actor.anim.name === "shoot") { pose.frontArm = -1.12; pose.backArm = -.78; pose.lean = frame === 3 ? -.08 : .04; }
    if (actor.anim.name === "hurt") { pose.lean = -.18; pose.frontArm = .55; pose.backArm = .3; }
    if (actor.anim.name === "ko") { pose.rotation = Math.min(1.35, phase * 1.55); pose.drop = phase * 58; }
    return pose;
  }

  function drawWholeRobot(actor, x, bottom) {
    const actionArt = getPlayerActionArt(actor);
    const image = images[actionArt?.key || actor.robot];
    if (!image.complete || !image.naturalWidth) return;
    const bossScale = actor.kind === "boss" ? 1.35 : 1;
    const width = actionArt?.width || 245 * bossScale;
    const height = actionArt?.height || 330 * bossScale;
    const pose = poseFor(actor);
    const alpha = actor.kind === "player" && actor.invulnerable > 0 && Math.floor(actor.invulnerable * 16) % 2 ? .38 : actor.hit ? .72 : 1;
    const phase = actor.anim.frame / Math.max(1, (clips[actor.anim.name] || clips.idle)[0] - 1);
    const strike = ["punch", "kick", "enemyAttack"].includes(actor.anim.name) ? Math.sin(phase * Math.PI) : 0;
    const recoil = actor.anim.name === "shoot" && actor.anim.frame >= 2 ? -7 : 0;
    const offsetX = actor.facing * ((actionArt ? 0 : pose.lean * 70) + strike * (actionArt ? 12 : 18) + recoil + (actionArt?.anchorX || 0));
    const flip = actor.facing / (actor.robotArtFacing || 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x + offsetX, bottom + pose.drop - (actionArt ? 0 : pose.bob));
    ctx.rotate(pose.rotation * actor.facing);
    ctx.scale(flip, 1);
    drawContainedImageAtOrigin(image, width, height);
    ctx.restore();
  }

  function getPlayerActionArt(actor) {
    if (actor.kind !== "player" || !actor.action) return null;
    const frame = actor.anim.frame;
    if (["punch", "sonic"].includes(actor.action.type) && frame >= 1 && frame <= 3) {
      return { key: actor.actionArt.punch, width: 350, height: 330, anchorX: 10 };
    }
    if (actor.action.type === "kick" && frame >= 2 && frame <= 4) {
      return { key: actor.actionArt.kick, width: 430, height: 330, anchorX: 36 };
    }
    if (actor.action.type === "shoot" && frame >= 1 && frame <= 3) {
      const level = clamp(actor.weapon, 1, 3);
      return {
        key: actor.actionArt.guns[level - 1],
        width: [335, 405, 455][level - 1],
        height: 330,
        anchorX: [24, 54, 78][level - 1],
      };
    }
    return null;
  }

  function drawMinionRobot(actor, x, bottom) {
    const attacking = actor.anim.name === "enemyAttack" && actor.anim.frame >= 1 && actor.anim.frame <= 3;
    const image = images[attacking ? actor.attackArt : actor.robot];
    if (!image.complete || !image.naturalWidth) return;
    const pose = poseFor(actor);
    const phase = actor.anim.frame / Math.max(1, (clips[actor.anim.name] || clips.idle)[0] - 1);
    const lunge = attacking ? Math.sin(phase * Math.PI) * 12 : 0;
    const alpha = actor.hit ? .72 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x + actor.facing * lunge, bottom + pose.drop - (attacking ? 0 : pose.bob));
    ctx.rotate(pose.rotation * actor.facing);
    ctx.scale(actor.facing / actor.artFacing, 1);
    drawContainedImageAtOrigin(image, ...(attacking ? actor.attackSize : actor.size));
    ctx.restore();
  }

  function drawRunRobot(actor, x, bottom) {
    const image = images[actor.runSheet];
    if (!image.complete || !image.naturalWidth) return;
    const frames = runFrameBounds[actor.runSheet][actor.runRow];
    const [sourceX, sourceY, sourceRight, sourceBottom] = frames[actor.anim.frame % frames.length];
    const sourceWidth = sourceRight - sourceX;
    const sourceHeight = sourceBottom - sourceY;
    const boss = actor.kind === "boss";
    const targetHeight = boss ? 410 : actor.kind === "minion" ? actor.size[1] * .94 : 305;
    const scale = targetHeight / sourceHeight;
    const width = sourceWidth * scale;
    const alpha = actor.kind === "player" && actor.invulnerable > 0 && Math.floor(actor.invulnerable * 16) % 2 ? .38 : actor.hit ? .72 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, bottom);
    ctx.scale(actor.facing / actor.runArtFacing, 1);
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, -width / 2, -targetHeight, width, targetHeight);
    ctx.restore();
  }

  function drawEnemyBar(enemy, x, y, width) {
    ctx.save(); ctx.font = enemy.kind === "boss" ? "900 17px Courier New" : "900 12px Courier New"; ctx.textAlign = "center"; ctx.fillStyle = "#f3e5ca"; ctx.fillText(enemy.name, x, y - 7); ctx.fillStyle = "#1d1610"; ctx.fillRect(x - width / 2, y, width, 10); ctx.fillStyle = enemy.kind === "boss" ? "#bd3038" : "#f2a24a"; ctx.fillRect(x - width / 2 + 1, y + 1, (width - 2) * enemy.hp / enemy.maxHp, 8); ctx.restore();
  }
  function drawProjectiles() {
    for (const shot of game.projectiles) { const x = shot.x - game.camera; ctx.save(); ctx.fillStyle = shot.explosive ? "#ffd02c" : "#f3e5ca"; ctx.shadowColor = "#f2a24a"; ctx.shadowBlur = 18; ctx.fillRect(x - shot.width / 2, shot.y - shot.height / 2, shot.width, shot.height); ctx.fillStyle = "#f2a24a"; ctx.fillRect(x - Math.sign(shot.vx) * (shot.width / 2 + 25), shot.y - 3, 24, 6); ctx.restore(); }
  }
  function drawImpacts() {
    for (const flash of game.impacts) {
      const progress = 1 - flash.life / flash.maxLife;
      const alpha = Math.max(0, 1 - progress);
      const x = flash.x - game.camera;
      const radius = flash.size * (.35 + progress * .85);
      ctx.save();
      ctx.translate(x, flash.y);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = flash.color;
      ctx.lineWidth = 10 * (1 - progress) + 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#15171b";
      ctx.lineWidth = 5;
      for (let i = 0; i < 8; i += 1) {
        const angle = i * Math.PI / 4 + progress * .25;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * radius * .65, Math.sin(angle) * radius * .65);
        ctx.lineTo(Math.cos(angle) * radius * 1.55, Math.sin(angle) * radius * 1.55);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  function drawParticles() { for (const p of game.particles) { ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color; ctx.fillRect(p.x - game.camera, p.y, p.size, p.size); } ctx.globalAlpha = 1; }
  function drawImageBottom(image, x, bottom, width, height, facing = 1) { if (!image.complete || !image.naturalWidth) return; ctx.save(); ctx.translate(x, bottom); ctx.scale(facing, 1); ctx.drawImage(image, -width / 2, -height, width, height); ctx.restore(); }
  function drawContainedImageAtOrigin(image, maxWidth, maxHeight) {
    if (!image.complete || !image.naturalWidth) return;
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    ctx.drawImage(image, -width / 2, -height, width, height);
  }
  function drawContainedImageBottom(image, x, bottom, maxWidth, maxHeight, facing = 1) {
    if (!image.complete || !image.naturalWidth) return;
    ctx.save();
    ctx.translate(x, bottom);
    ctx.scale(facing, 1);
    drawContainedImageAtOrigin(image, maxWidth, maxHeight);
    ctx.restore();
  }
  function drawShadow(x, y, width) { ctx.save(); ctx.translate(x, y); ctx.scale(1, .24); ctx.fillStyle = "rgba(0,0,0,.68)"; ctx.beginPath(); ctx.arc(0, 0, width / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  function burstOnce(actor, x, y, color, count) { if (actor.burstFrame === actor.anim.frame) return; actor.burstFrame = actor.anim.frame; burst(x, y, color, count); }
  function burst(x, y, color, count) { for (let i = 0; i < count; i += 1) { const angle = Math.random() * Math.PI * 2; const speed = 80 + Math.random() * 230; game.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 80, life: .45 + Math.random() * .35, maxLife: .8, size: 4 + Math.random() * 8, color }); } }
  function impact(x, y, size, color) { game.impacts.push({ x, y, size, color, life: .22, maxLife: .22 }); }
  function updateHud() {
    if (!game) return;
    const p = game.player;
    $("#hero-name").textContent = p.name; $("#level-label").textContent = `LV.${p.level}`; $("#hp-fill").style.width = `${Math.max(0, p.hp / p.maxHp * 100)}%`;
    const previous = levelThresholds[p.level - 1] || 0; const next = levelThresholds[p.level] || previous + 1;
    $("#xp-fill").style.width = `${p.level >= 4 ? 100 : clamp((p.xp - previous) / (next - previous) * 100, 0, 100)}%`;
    $("#weapon-label").textContent = weaponNames[p.weapon]; $("#combo-label").textContent = `COMBO × ${p.combo}`;
  }
  function setMission(text) { $("#mission").textContent = text; }
  function showWord(text) { const word = $("#comic-word"); word.textContent = text; word.classList.remove("show"); void word.offsetWidth; word.classList.add("show"); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { const v = clamp(t, 0, 1); return 1 - Math.pow(1 - v, 3); }

  $("#start-button").addEventListener("click", () => {
    $("#title-screen").classList.remove("active");
    $("#select-screen").classList.add("active");
  });
  $$(".hero-option").forEach((button) => button.addEventListener("click", () => startGame(button.dataset.hero)));
  $$("[data-upgrade]").forEach((button) => button.addEventListener("click", () => chooseUpgrade(button.dataset.upgrade)));
  $("#restart-button").addEventListener("click", () => startGame(game.player.id));
  $("#change-button").addEventListener("click", () => { cancelAnimationFrame(raf); game = null; $("#play-screen").classList.remove("active"); $("#end-panel").classList.remove("show"); $("#select-screen").classList.add("active"); });
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d", "j", "k", "l"].includes(key)) event.preventDefault();
    if (!event.repeat) { if (key === "j") melee("punch"); if (key === "k") melee("kick"); if (key === "l") useSkill(); }
    keys.add(key);
  });
  window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener("blur", () => keys.clear());

})();

