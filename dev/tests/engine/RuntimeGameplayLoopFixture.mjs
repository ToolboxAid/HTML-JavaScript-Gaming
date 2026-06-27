/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeGameplayLoopFixture.mjs
*/

export function createRuntimeGameplayLoopManifest() {
  return {
    schema: "html-js-gaming.game-manifest",
    version: 1,
    game: {
      id: "runtime-gameplay-loop",
      name: "Runtime Gameplay Loop",
      folder: "games/runtime-gameplay-loop",
    },
    launch: {
      directPath: "games/runtime-gameplay-loop/index.html",
      workspaceManagerOptional: true,
    },
    objects: {
      "object.player": {
        objectType: "dynamic",
        geometryRef: "geometry.player",
        rules: ["movement.player", "despawn.player"],
      },
      "object.coin": {
        objectType: "collectible",
        geometryRef: "geometry.coin",
        rules: ["collect.coin"],
      },
      "object.exit": {
        objectType: "trigger",
        geometryRef: "geometry.exit",
        rules: ["transition.exit"],
      },
    },
    terrainMaterials: {
      grass: {
        passable: true,
        blocked: false,
        friction: 0.1,
      },
      wall: {
        passable: false,
        blocked: true,
      },
    },
    environmentForces: {
      breeze: {
        forceType: "wind",
        vector: { x: 1, y: 0 },
        strength: 0.5,
      },
    },
    rules: {
      "spawn.coin": {
        ruleType: "spawn",
        targets: ["object.coin"],
        parameters: {},
      },
      "despawn.player": {
        ruleType: "despawn",
        targets: ["object.player"],
        parameters: {},
      },
      "collect.coin": {
        ruleType: "scoring",
        targets: ["object.coin"],
        parameters: {},
      },
      "transition.exit": {
        ruleType: "collision",
        targets: ["object.exit"],
        parameters: {},
      },
    },
    scenes: [
      {
        sceneId: "scene.start",
        objectInstances: [
          {
            instanceId: "player.1",
            objectId: "object.player",
            position: { x: 1, y: 1 },
            size: { width: 1, height: 1 },
            velocity: { x: 0, y: 0 },
            health: 100,
          },
        ],
        terrainAssignments: {
          "player.1": "grass",
        },
        terrainTiles: [
          {
            tileId: "tile.wall.start",
            materialId: "wall",
            material: {
              materialId: "wall",
              passable: false,
              blocked: true,
            },
            bounds: { x: 8, y: 1, width: 1, height: 1 },
          },
        ],
        environmentForceIds: ["breeze"],
        transitionIds: ["scene.bonus"],
        spawnDefinitions: [
          {
            ruleId: "spawn.coin",
            instanceId: "coin.1",
            objectId: "object.coin",
            position: { x: 4, y: 1 },
            size: { width: 1, height: 1 },
            velocity: { x: 0, y: 0 },
          },
        ],
        scoringDefinitions: [
          {
            ruleId: "collect.coin",
            scoreKey: "coins",
            points: 10,
          },
        ],
        stateDefinitions: [
          {
            ruleId: "transition.exit",
            stateKey: "exitOpen",
            operation: "set",
            value: true,
          },
        ],
      },
      {
        sceneId: "scene.bonus",
        objectInstances: [
          {
            instanceId: "player.bonus",
            objectId: "object.player",
            position: { x: 1, y: 1 },
            size: { width: 1, height: 1 },
            velocity: { x: 0, y: 0 },
            health: 100,
          },
        ],
        terrainAssignments: {
          "player.bonus": "grass",
        },
        terrainTiles: [],
        environmentForceIds: [],
        transitionIds: [],
        spawnDefinitions: [],
        scoringDefinitions: [],
        stateDefinitions: [],
      },
    ],
  };
}
