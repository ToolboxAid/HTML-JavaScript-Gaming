/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeManifestDrivenFixture.mjs
*/

export function createManifestDrivenRuntimeFixture() {
  return {
    schema: "html-js-gaming.game-manifest",
    version: 1,
    game: {
      id: "manifest-driven-fixture",
      name: "Manifest Driven Fixture",
      folder: "games/manifest-driven-fixture",
    },
    launch: {
      directPath: "games/manifest-driven-fixture/index.html",
      workspaceManagerOptional: true,
    },
    screen: {
      width: 320,
      height: 180,
    },
    fixedDeltaMs: 100,
    objects: {
      "object.player": {
        objectType: "dynamic",
        geometryRef: "geometry.player",
        rules: ["movement.player"],
      },
      "object.wall": {
        objectType: "static",
        geometryRef: "geometry.wall",
        rules: ["collision.wall"],
      },
      "object.bumblebee": {
        objectType: "killable",
        geometryRef: "geometry.bumblebee",
        rules: ["health.bumblebee"],
      },
    },
    objectInstances: [
      {
        instanceId: "player.1",
        objectId: "object.player",
        position: { x: 1, y: 1 },
        size: { width: 1, height: 1 },
        velocity: { x: 0, y: 0 },
        health: 100,
      },
      {
        instanceId: "wall.1",
        objectId: "object.wall",
        position: { x: 10, y: 1 },
        size: { width: 1, height: 1 },
        velocity: { x: 0, y: 0 },
      },
      {
        instanceId: "bumblebee.1",
        objectId: "object.bumblebee",
        position: { x: 5, y: 1 },
        size: { width: 1, height: 1 },
        velocity: { x: 0, y: 0 },
        health: 20,
        contactDamage: 5,
      },
    ],
    terrainMaterials: {
      grass: {
        passable: true,
        blocked: false,
        friction: 0.1,
      },
      ice: {
        passable: true,
        blocked: false,
        slide: { x: 2, y: 0 },
        friction: 0.02,
      },
      mud: {
        passable: true,
        blocked: false,
        drag: 0.5,
        friction: 0.4,
      },
      lava: {
        passable: true,
        blocked: false,
        surfaceDamage: 4,
      },
      wall: {
        passable: false,
        blocked: true,
      },
    },
    terrainAssignments: {
      "player.1": "grass",
      "bumblebee.1": "ice",
    },
    terrainTiles: [
      {
        tileId: "tile.wall.1",
        materialId: "wall",
        material: {
          materialId: "wall",
          passable: false,
          blocked: true,
        },
        bounds: { x: 10, y: 1, width: 1, height: 1 },
      },
      {
        tileId: "tile.grass.1",
        materialId: "grass",
        material: {
          materialId: "grass",
          passable: true,
          blocked: false,
        },
        bounds: { x: 1, y: 1, width: 1, height: 1 },
      },
    ],
    environmentForces: {
      wind: {
        forceType: "wind",
        vector: { x: 1, y: 0 },
        strength: 1,
      },
      gravity: {
        forceType: "gravityField",
        vector: { x: 0, y: 1 },
        strength: 9.8,
      },
      rain: {
        forceType: "weather",
        weatherType: "rain",
        globalModifiers: ["surface.drag.wet"],
      },
    },
    rules: {
      "movement.player": {
        ruleType: "movement",
        targets: ["object.player"],
        parameters: { speed: 10 },
      },
      "collision.wall": {
        ruleType: "collision",
        targets: ["object.wall"],
        parameters: { blocked: true },
      },
      "health.bumblebee": {
        ruleType: "health",
        targets: ["object.bumblebee"],
        parameters: { maxHealth: 20 },
      },
    },
    inputBindings: [
      {
        actionId: "move.right",
        keys: ["ArrowRight"],
        targetInstanceId: "player.1",
        velocity: { x: 10, y: 0 },
      },
    ],
    rendering: {
      targetId: "runtime-canvas",
      width: 320,
      height: 180,
    },
  };
}

export function createValidEngineFixture() {
  return Object.freeze({
    manifest: createManifestDrivenRuntimeFixture(),
    inputEvents: Object.freeze([
      Object.freeze({ key: "ArrowRight", pressed: true }),
    ]),
  });
}

export function createInvalidEngineFixtures() {
  const manifest = createManifestDrivenRuntimeFixture();

  return Object.freeze({
    missingSchema: Object.freeze({
      ...manifest,
      schema: "",
    }),
    missingObjectInstances: Object.freeze({
      ...manifest,
      objectInstances: undefined,
    }),
    invalidTerrainMaterial: Object.freeze({
      ...manifest,
      terrainMaterials: Object.freeze({
        bad: Object.freeze({
          passable: true,
          blocked: true,
        }),
      }),
    }),
    invalidEnvironmentForce: Object.freeze({
      ...manifest,
      environmentForces: Object.freeze({
        wind: Object.freeze({
          forceType: "wind",
          strength: 1,
        }),
      }),
    }),
    missingRuleAttachment: Object.freeze({
      ...manifest,
      objects: Object.freeze({
        ...manifest.objects,
        "object.player": Object.freeze({
          ...manifest.objects["object.player"],
          rules: Object.freeze(["missing.rule"]),
        }),
      }),
    }),
    invalidInputBinding: Object.freeze({
      ...manifest,
      inputBindings: Object.freeze([
        Object.freeze({ actionId: "move.right" }),
      ]),
    }),
    blockedCollisionScene: Object.freeze({
      ...manifest,
      terrainTiles: Object.freeze([
        Object.freeze({
          tileId: "tile.wall.uat",
          materialId: "wall",
          material: Object.freeze({
            materialId: "wall",
            passable: false,
            blocked: true,
          }),
          bounds: Object.freeze({ x: 2, y: 1, width: 1, height: 1 }),
        }),
      ]),
    }),
  });
}
