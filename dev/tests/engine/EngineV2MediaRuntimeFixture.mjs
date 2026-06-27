/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2MediaRuntimeFixture.mjs
*/

export function createEngineV2MediaRuntimeFixture() {
  return {
    animationDefinitions: [
      {
        animationId: "animation.player.idle",
        frames: ["player.idle.0", "player.idle.1"],
        frameDurationMs: 100,
        loop: true,
      },
      {
        animationId: "animation.player.jump",
        frames: ["player.jump.0", "player.jump.1", "player.jump.2"],
        frameDurationMs: 80,
        loop: false,
      },
    ],
    objectAnimationStates: [
      {
        instanceId: "player.1",
        animationId: "animation.player.idle",
        frameIndex: 0,
        elapsedMs: 0,
        finished: false,
      },
    ],
    runtimeObjectStates: {
      "player.1": {
        animationId: "animation.player.jump",
      },
    },
    cameraConfig: {
      cameraId: "camera.main",
      cameraType: "follow",
      targetInstanceId: "player.1",
      zoom: 2,
      bounds: { x: 0, y: 0, width: 320, height: 180 },
      deadZone: { x: 40, y: 30, width: 80, height: 60 },
    },
    fixedCameraConfig: {
      cameraId: "camera.fixed",
      cameraType: "fixed",
      zoom: 1,
      bounds: { x: 0, y: 0, width: 320, height: 180 },
      position: { x: 140, y: 60 },
    },
    cameraState: {
      x: 0,
      y: 0,
    },
    viewport: {
      width: 160,
      height: 90,
    },
    runtimeObjects: [
      {
        instanceId: "player.1",
        position: { x: 130, y: 70 },
        size: { width: 10, height: 10 },
      },
    ],
    audioManifest: {
      volumeGroups: [
        {
          volumeGroupId: "sfx",
          volume: 0.75,
        },
        {
          volumeGroupId: "music",
          volume: 0.5,
        },
      ],
      soundEvents: [
        {
          soundEventId: "sound.coin",
          eventType: "event.coinCollision",
          soundId: "sfx.coin",
          volumeGroupId: "sfx",
        },
      ],
      musicTracks: [
        {
          musicId: "music.scene.start",
          sceneId: "scene.start",
          volumeGroupId: "music",
          loop: true,
        },
      ],
      actionPlayback: [
        {
          actionPlaybackId: "sound.damage",
          actionType: "damage",
          soundId: "sfx.damage",
          volumeGroupId: "sfx",
        },
      ],
    },
    runtimeEvents: [
      {
        eventId: "event.coin.0",
        eventType: "event.coinCollision",
      },
    ],
    actionOutcomes: [
      {
        actionId: "action.damage.enemy",
        actionType: "damage",
      },
    ],
    audioState: {
      activeSceneId: "scene.start",
      activeMusicId: null,
    },
  };
}
