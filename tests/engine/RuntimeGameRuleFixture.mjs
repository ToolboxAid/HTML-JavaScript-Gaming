/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeGameRuleFixture.mjs
*/

export function createRuntimeGameRuleFixture() {
  return {
    conditionDefinitions: [
      {
        conditionId: "condition.coin.collision",
        conditionType: "collision",
        eventType: "event.coinCollision",
        sourceInstanceId: "player.1",
        targetInstanceId: "coin.1",
      },
      {
        conditionId: "condition.exit.overlap",
        conditionType: "overlap",
        eventType: "event.exitOverlap",
        sourceInstanceId: "player.1",
        targetInstanceId: "exit.1",
      },
      {
        conditionId: "condition.timer.ready",
        conditionType: "timer",
        eventType: "event.timerReady",
        thresholdMs: 1000,
      },
      {
        conditionId: "condition.score.ready",
        conditionType: "scoreReached",
        eventType: "event.scoreReady",
        scoreKey: "coins",
        minScore: 10,
      },
      {
        conditionId: "condition.enemy.destroyed",
        conditionType: "objectDestroyed",
        eventType: "event.enemyDestroyed",
        instanceId: "enemy.1",
      },
      {
        conditionId: "condition.coin.spawned",
        conditionType: "objectSpawned",
        eventType: "event.coinSpawned",
        instanceId: "coin.1",
      },
    ],
    runtimeFacts: {
      collisions: [
        {
          sourceInstanceId: "player.1",
          targetInstanceId: "coin.1",
        },
      ],
      overlaps: [
        {
          sourceInstanceId: "player.1",
          targetInstanceId: "exit.1",
        },
      ],
      elapsedMs: 1200,
      scores: {
        coins: 10,
      },
      destroyedObjectIds: ["enemy.1"],
      spawnedObjectIds: ["coin.1"],
    },
    runtimeEvents: [
      {
        eventId: "event.runtime.frameStart.0",
        eventType: "event.runtimeFrameStart",
        payload: {},
      },
    ],
    actionDefinitions: [
      {
        actionId: "action.spawn.coin",
        actionType: "spawn",
        eventType: "event.timerReady",
        ruleId: "spawn.coin",
      },
      {
        actionId: "action.despawn.coin",
        actionType: "despawn",
        eventType: "event.coinCollision",
        targetInstanceId: "coin.1",
      },
      {
        actionId: "action.damage.enemy",
        actionType: "damage",
        eventType: "event.exitOverlap",
        targetInstanceId: "enemy.1",
        amount: 5,
      },
      {
        actionId: "action.heal.player",
        actionType: "heal",
        eventType: "event.coinSpawned",
        targetInstanceId: "player.1",
        amount: 5,
      },
      {
        actionId: "action.score.coin",
        actionType: "score",
        eventType: "event.coinCollision",
        scoreKey: "coins",
        points: 10,
      },
      {
        actionId: "action.scene.bonus",
        actionType: "sceneChange",
        eventType: "event.scoreReady",
        toSceneId: "scene.bonus",
      },
      {
        actionId: "action.state.enemyDefeated",
        actionType: "stateChange",
        eventType: "event.enemyDestroyed",
        stateKey: "enemyDefeated",
        operation: "set",
        value: true,
      },
    ],
  };
}
