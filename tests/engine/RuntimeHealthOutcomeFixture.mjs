/*
Toolbox Aid
David Quesenberry
06/03/2026
RuntimeHealthOutcomeFixture.mjs
*/

export function createRuntimeHealthOutcomeFixture() {
  return {
    currentTimeMs: 1000,
    healthDefinitions: [
      {
        instanceId: "player.1",
        health: 80,
        maxHealth: 100,
        invulnerableUntilMs: 0,
        alive: true,
      },
      {
        instanceId: "enemy.1",
        health: 20,
        maxHealth: 40,
        invulnerableUntilMs: 1500,
        alive: true,
      },
      {
        instanceId: "hazard.1",
        health: 0,
        maxHealth: 10,
        invulnerableUntilMs: 0,
        alive: false,
      },
    ],
    damageSources: [
      {
        sourceId: "action.damage.enemy",
        sourceType: "action",
        targetInstanceId: "player.1",
        amount: 25,
      },
      {
        sourceId: "terrain.lava.1",
        sourceType: "terrain",
        targetInstanceId: "enemy.1",
        amount: 10,
      },
      {
        sourceId: "collision.spike.1",
        sourceType: "collision",
        targetInstanceId: "player.1",
        amount: 10,
      },
      {
        sourceId: "trigger.blast.1",
        sourceType: "trigger",
        targetInstanceId: "player.1",
        amount: 5,
      },
    ],
    lifeRecords: [
      {
        instanceId: "player.1",
        lives: 3,
        respawnRuleId: "respawn.player.start",
        alive: true,
        sceneId: "scene.start",
        position: { x: 8, y: 4 },
      },
      {
        instanceId: "enemy.1",
        lives: 1,
        respawnRuleId: "respawn.enemy.start",
        alive: true,
        sceneId: "scene.start",
        position: { x: 3, y: 2 },
      },
    ],
    respawnRules: [
      {
        respawnRuleId: "respawn.player.start",
        sceneId: "scene.start",
        position: { x: 1, y: 1 },
      },
      {
        respawnRuleId: "respawn.enemy.start",
        sceneId: "scene.start",
        position: { x: 5, y: 2 },
      },
    ],
    lifeEvents: [
      {
        eventType: "death",
        targetInstanceId: "player.1",
      },
      {
        eventType: "death",
        targetInstanceId: "enemy.1",
      },
    ],
    cooldownDefinitions: [
      {
        cooldownId: "cooldown.dash.player",
        ownerInstanceId: "player.1",
        actionId: "action.dash",
        durationMs: 500,
      },
      {
        cooldownId: "cooldown.blast.player",
        ownerInstanceId: "player.1",
        actionId: "action.blast",
        durationMs: 1000,
      },
    ],
    cooldownStates: [
      {
        cooldownId: "cooldown.dash.player",
        availableAtMs: 0,
      },
      {
        cooldownId: "cooldown.blast.player",
        availableAtMs: 1500,
      },
    ],
    actionRequests: [
      {
        requestId: "request.dash.1",
        cooldownId: "cooldown.dash.player",
        ownerInstanceId: "player.1",
        actionId: "action.dash",
      },
      {
        requestId: "request.blast.1",
        cooldownId: "cooldown.blast.player",
        ownerInstanceId: "player.1",
        actionId: "action.blast",
      },
    ],
    outcomeDefinitions: [
      {
        outcomeId: "outcome.score.win",
        outcomeType: "win",
        conditionType: "score",
        scoreKey: "coins",
        comparator: "gte",
        value: 10,
      },
      {
        outcomeId: "outcome.health.lose",
        outcomeType: "lose",
        conditionType: "health",
        instanceId: "enemy.1",
        comparator: "lte",
        value: 0,
      },
      {
        outcomeId: "outcome.lives.lose",
        outcomeType: "lose",
        conditionType: "lives",
        instanceId: "enemy.1",
        comparator: "eq",
        value: 0,
      },
      {
        outcomeId: "outcome.timer.draw",
        outcomeType: "draw",
        conditionType: "timer",
        comparator: "gte",
        value: 1000,
      },
      {
        outcomeId: "outcome.object.state",
        outcomeType: "state",
        conditionType: "objectState",
        instanceId: "door.1",
        stateKey: "open",
        comparator: "eq",
        value: true,
      },
      {
        outcomeId: "outcome.scene.state",
        outcomeType: "state",
        conditionType: "sceneState",
        sceneId: "scene.start",
        stateKey: "cleared",
        comparator: "eq",
        value: true,
      },
    ],
    runtimeState: {
      scores: {
        coins: 10,
      },
      healthRecords: [
        {
          instanceId: "player.1",
          health: 45,
          maxHealth: 100,
          invulnerableUntilMs: 0,
          alive: true,
        },
        {
          instanceId: "enemy.1",
          health: 0,
          maxHealth: 40,
          invulnerableUntilMs: 0,
          alive: false,
        },
      ],
      lifeRecords: [
        {
          instanceId: "player.1",
          lives: 2,
        },
        {
          instanceId: "enemy.1",
          lives: 0,
        },
      ],
      elapsedMs: 1200,
      objectStates: {
        "door.1": {
          open: true,
        },
      },
      sceneStates: {
        "scene.start": {
          cleared: true,
        },
      },
    },
  };
}
