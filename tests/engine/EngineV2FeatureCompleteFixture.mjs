/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2FeatureCompleteFixture.mjs
*/

import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function createEngineV2FeatureCompleteFixture() {
  const manifest = createManifestDrivenRuntimeFixture();

  return {
    stateMachine: createStateMachineFixture(),
    ui: createUiFixture(),
    effects: createEffectFixture(),
    modifiers: createModifierFixture(),
    saveLoad: createSaveLoadFixture(),
    proofScene: createProofSceneFixture(manifest),
  };
}

function createStateMachineFixture() {
  const scopes = [
    ["object", "hero.1", "idle", "moving"],
    ["scene", "scene.start", "loading", "active"],
    ["ui", "hud.main", "hidden", "visible"],
    ["door", "door.north", "closed", "open"],
    ["interaction", "npc.elder", "available", "completed"],
    ["combat", "encounter.1", "ready", "engaged"],
  ];

  return {
    transitionDefinitions: scopes.map(([stateScope, ownerId, fromState, toState]) => ({
      transitionId: `transition.${stateScope}.${ownerId}`,
      stateScope,
      ownerId,
      fromState,
      toState,
      requiredConditionIds: [`condition.${stateScope}.${ownerId}`],
    })),
    stateRecords: scopes.map(([stateScope, ownerId, currentState]) => ({
      stateScope,
      ownerId,
      currentState,
    })),
    transitionRequests: scopes.map(([stateScope, ownerId]) => ({
      requestId: `request.${stateScope}.${ownerId}`,
      transitionId: `transition.${stateScope}.${ownerId}`,
      stateScope,
      ownerId,
    })),
    conditionMatches: scopes.map(([stateScope, ownerId]) => ({
      conditionId: `condition.${stateScope}.${ownerId}`,
    })),
  };
}

function createUiFixture() {
  return {
    uiDefinitions: [
      { widgetId: "ui.health", widgetType: "healthBar", label: "Health", source: { instanceId: "hero.1" } },
      { widgetId: "ui.score", widgetType: "score", label: "Score", source: { scoreKey: "coins" } },
      { widgetId: "ui.inventory", widgetType: "inventory", label: "Inventory", source: { inventoryId: "inventory.hero" } },
      { widgetId: "ui.dialogue", widgetType: "dialogue", label: "Dialogue", source: { dialogueId: "dialogue.elder" } },
      { widgetId: "ui.quest", widgetType: "questTracker", label: "Quest", source: { questId: "quest.main" } },
      { widgetId: "ui.timer", widgetType: "timer", label: "Timer", source: { timerKey: "round" } },
      { widgetId: "ui.status", widgetType: "status", label: "Status", source: { targetInstanceId: "hero.1" } },
      { widgetId: "ui.pause", widgetType: "pauseMenu", label: "Pause", source: { stateKey: "paused" } },
    ],
    runtimeState: {
      healthRecords: [{ instanceId: "hero.1", health: 80, maxHealth: 100, invulnerableUntilMs: 0, alive: true }],
      scores: { coins: 12 },
      inventoryStates: [{ inventoryId: "inventory.hero", ownerInstanceId: "hero.1", slots: [{ slotId: "slot.1", itemId: "item.gem", quantity: 3 }] }],
      dialogueStates: [{ dialogueId: "dialogue.elder", currentNodeId: "start" }],
      questStates: [{ questId: "quest.main", status: "active" }],
      timers: { round: 15000 },
      statusEffects: [{ effectInstanceId: "status.haste.1", targetInstanceId: "hero.1", statusEffectId: "status.haste" }],
      pauseState: { paused: false },
    },
  };
}

function createEffectFixture() {
  const effectTypes = ["explosion", "dust", "snow", "rain", "fire", "smoke", "sparkles", "hit", "pickup"];

  return {
    effectDefinitions: effectTypes.map((effectType) => ({
      effectId: `effect.${effectType}`,
      effectType,
      durationMs: 1000,
      payload: { particleBudget: 12 },
    })),
    effectRequests: effectTypes.map((effectType, index) => ({
      requestId: `effect.request.${effectType}`,
      effectId: `effect.${effectType}`,
      targetInstanceId: index % 2 === 0 ? "hero.1" : "enemy.1",
      position: { x: index, y: index + 1 },
    })),
    activeEffects: [
      { effectInstanceId: "effect.active.smoke", effectId: "effect.smoke", effectType: "smoke", remainingMs: 500 },
    ],
    deltaMs: 100,
  };
}

function createModifierFixture() {
  return {
    baseValues: {
      "hero.1.speed": 10,
    },
    modifiers: [
      { modifierId: "modifier.terrain.ice", sourceType: "terrain", targetInstanceId: "hero.1", channel: "speed", operation: "multiply", value: 0.8, order: 10 },
      { modifierId: "modifier.object.sprint", sourceType: "object", targetInstanceId: "hero.1", channel: "speed", operation: "add", value: 2, order: 20 },
      { modifierId: "modifier.environment.wind", sourceType: "environment", targetInstanceId: "hero.1", channel: "speed", operation: "add", value: -1, order: 30 },
      { modifierId: "modifier.status.slow", sourceType: "statusEffect", targetInstanceId: "hero.1", channel: "speed", operation: "multiply", value: 0.5, order: 40 },
      { modifierId: "modifier.equipment.boots", sourceType: "equipment", targetInstanceId: "hero.1", channel: "speed", operation: "add", value: 3, order: 50 },
      { modifierId: "modifier.ability.haste", sourceType: "ability", targetInstanceId: "hero.1", channel: "speed", operation: "multiply", value: 2, order: 60 },
      { modifierId: "modifier.rule.cap", sourceType: "rule", targetInstanceId: "hero.1", channel: "speed", operation: "set", value: 12, order: 70 },
    ],
  };
}

function createSaveLoadFixture() {
  return {
    saveDefinition: {
      saveStateId: "save.proof.1",
      ownerInstanceId: "hero.1",
      projectId: "project.engine-v2",
      version: "1.0.0",
      persistedSurfaces: ["inventory", "equipment", "state"],
    },
    runtimeState: {
      inventory: [{ inventoryId: "inventory.hero", ownerInstanceId: "hero.1", slots: [{ slotId: "slot.1", itemId: "item.gem", quantity: 3 }] }],
      equipment: [{ equipmentId: "equipment.hero", ownerInstanceId: "hero.1", equipped: [{ slotId: "weapon", itemId: "item.sword" }] }],
      state: {
        sceneState: { sceneId: "scene.start", state: "active" },
        objectives: [{ objectiveId: "objective.collect", progress: 3, completed: true }],
        health: [{ instanceId: "hero.1", health: 80, maxHealth: 100, invulnerableUntilMs: 0, alive: true }],
        position: { "hero.1": { x: 4, y: 2 } },
        runtime: { frame: 10, elapsedMs: 1000 },
      },
    },
    shutdownState: {},
    loadRequest: { saveStateId: "save.proof.1" },
    continueRequest: { saveStateId: "save.proof.1" },
  };
}

function createProofSceneFixture(manifest) {
  return {
    manifest: {
      ...manifest,
      engineV2: {
        inventory: {
          inventoryDefinitions: [{ inventoryId: "inventory.hero", ownerInstanceId: "player.1", capacity: 4, slotIds: ["slot.1", "slot.2", "slot.3", "slot.4"] }],
          inventoryStates: [{ inventoryId: "inventory.hero", ownerInstanceId: "player.1", slots: [{ slotId: "slot.1", itemId: "item.gem", quantity: 2 }] }],
          itemDefinitions: [{ itemId: "item.gem", itemType: "currencyItem", stackLimit: 20 }],
          inventoryActions: [{ actionId: "inventory.collect.gem", actionType: "add", inventoryId: "inventory.hero", itemId: "item.gem", quantity: 1 }],
        },
        combat: {
          healthRecords: [
            { instanceId: "player.1", health: 100, maxHealth: 100, invulnerableUntilMs: 0, alive: true },
            { instanceId: "bumblebee.1", health: 20, maxHealth: 20, invulnerableUntilMs: 0, alive: true },
          ],
          damageSources: [{ sourceId: "combat.hit.1", sourceType: "action", targetInstanceId: "bumblebee.1", amount: 20 }],
          currentTimeMs: 1000,
        },
        objectives: {
          objectiveDefinitions: [
            { objectiveId: "objective.collect.gems", objectiveType: "collect", criteria: { itemId: "item.gem" }, requiredValue: 3 },
            { objectiveId: "objective.defeat.bumblebee", objectiveType: "defeat", criteria: { targetType: "object.bumblebee" }, requiredValue: 1 },
          ],
          objectiveStates: [
            { objectiveId: "objective.collect.gems", progress: 0, completed: false },
            { objectiveId: "objective.defeat.bumblebee", progress: 0, completed: false },
          ],
          objectiveEvents: [
            { objectiveType: "collect", itemId: "item.gem", amount: 3 },
            { objectiveType: "defeat", targetType: "object.bumblebee", amount: 1 },
          ],
          runtimeState: {
            elapsedMs: 1000,
            scores: {},
          },
        },
        outcomes: {
          outcomeDefinitions: [
            { outcomeId: "outcome.win.score", outcomeType: "win", conditionType: "score", comparator: "gte", value: 10, scoreKey: "coins" },
            { outcomeId: "outcome.lose.enemy", outcomeType: "lose", conditionType: "health", comparator: "lte", value: 0, instanceId: "bumblebee.1" },
          ],
          runtimeState: {
            scores: { coins: 10 },
            healthRecords: [
              { instanceId: "player.1", health: 100, maxHealth: 100, invulnerableUntilMs: 0, alive: true },
              { instanceId: "bumblebee.1", health: 0, maxHealth: 20, invulnerableUntilMs: 0, alive: false },
            ],
            lifeRecords: [{ instanceId: "player.1", lives: 3 }],
            elapsedMs: 1000,
            objectStates: { "player.1": { state: "alive" } },
            sceneStates: { "scene.start": { cleared: true } },
          },
        },
        ui: {
          uiDefinitions: [
            { widgetId: "ui.health", widgetType: "healthBar", label: "Health", source: { instanceId: "player.1" } },
            { widgetId: "ui.score", widgetType: "score", label: "Score", source: { scoreKey: "coins" } },
            { widgetId: "ui.inventory", widgetType: "inventory", label: "Inventory", source: { inventoryId: "inventory.hero" } },
          ],
          runtimeState: {
            timers: { round: 1000 },
            statusEffects: [{ effectInstanceId: "status.haste.1", targetInstanceId: "player.1", statusEffectId: "status.haste" }],
            pauseState: { paused: false },
          },
        },
        saveLoad: {
          runtimeState: {
            inventory: [],
            equipment: [{ equipmentId: "equipment.hero", ownerInstanceId: "player.1", equipped: [] }],
            state: {
              sceneState: { sceneId: "scene.start", cleared: true },
              objectives: [],
              health: [],
              position: { "player.1": { x: 2, y: 1 } },
              runtime: { frame: 1, elapsedMs: 100 },
            },
          },
          shutdownState: {},
          loadRequest: { saveStateId: "save.proof.scene" },
          continueRequest: { saveStateId: "save.proof.scene" },
        },
      },
    },
    inputEvents: [{ key: "ArrowRight", pressed: true }],
    saveDefinition: {
      saveStateId: "save.proof.scene",
      ownerInstanceId: "player.1",
      projectId: "project.engine-v2",
      version: "1.0.0",
      persistedSurfaces: ["inventory", "equipment", "state"],
    },
  };
}
