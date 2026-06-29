/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2AudioRuntime.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_AUDIO_ERRORS,
  resolveEngineV2AudioRuntime,
} from "../../../www/src/engine/runtime/engineV2AudioRuntime.js";
import { createEngineV2MediaRuntimeFixture } from "./EngineV2MediaRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2MediaRuntimeFixture();
  const result = resolveEngineV2AudioRuntime({
    audioManifest: fixture.audioManifest,
    runtimeEvents: fixture.runtimeEvents,
    actionOutcomes: fixture.actionOutcomes,
    audioState: fixture.audioState,
  });

  assert.equal(result.valid, true);
  assert.equal(result.audioState.activeMusicId, "music.scene.start");
  assert.deepEqual(result.playbackCommands.map((command) => command.command), ["playSound", "playSound", "playMusic"]);
  assert.equal(result.playbackCommands[0].soundId, "sfx.coin");
  assert.equal(result.playbackCommands[1].source, "actionOutcome");
  assert.equal(result.playbackCommands[2].loop, true);

  const invalidManifest = {
    ...fixture.audioManifest,
    soundEvents: [
      {
        soundEventId: "sound.invalid",
        eventType: "event.invalid",
        soundId: "sfx.invalid",
        volumeGroupId: "missing",
      },
    ],
  };
  const invalidResult = resolveEngineV2AudioRuntime({
    audioManifest: invalidManifest,
    runtimeEvents: fixture.runtimeEvents,
    actionOutcomes: fixture.actionOutcomes,
    audioState: fixture.audioState,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_AUDIO_ERRORS.VOLUME_GROUP_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
