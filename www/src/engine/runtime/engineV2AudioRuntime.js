/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2AudioRuntime.js
*/

export const ENGINE_V2_AUDIO_ERRORS = Object.freeze({
  MANIFEST_INVALID: "ENGINE_V2_AUDIO_MANIFEST_INVALID",
  RUNTIME_EVENTS_INVALID: "ENGINE_V2_AUDIO_RUNTIME_EVENTS_INVALID",
  ACTION_OUTCOMES_INVALID: "ENGINE_V2_AUDIO_ACTION_OUTCOMES_INVALID",
  AUDIO_STATE_INVALID: "ENGINE_V2_AUDIO_STATE_INVALID",
  VOLUME_GROUP_INVALID: "ENGINE_V2_AUDIO_VOLUME_GROUP_INVALID",
  SOUND_EVENT_INVALID: "ENGINE_V2_AUDIO_SOUND_EVENT_INVALID",
  MUSIC_TRACK_INVALID: "ENGINE_V2_AUDIO_MUSIC_TRACK_INVALID",
  ACTION_PLAYBACK_INVALID: "ENGINE_V2_AUDIO_ACTION_PLAYBACK_INVALID",
  VOLUME_GROUP_MISSING: "ENGINE_V2_AUDIO_VOLUME_GROUP_MISSING",
  RUNTIME_EVENT_INVALID: "ENGINE_V2_AUDIO_RUNTIME_EVENT_INVALID",
  ACTION_OUTCOME_INVALID: "ENGINE_V2_AUDIO_ACTION_OUTCOME_INVALID",
});

export function resolveEngineV2AudioRuntime({ audioManifest, runtimeEvents, actionOutcomes, audioState }) {
  const errors = [];

  if (!isRecord(audioManifest) || !Array.isArray(audioManifest.volumeGroups) || !Array.isArray(audioManifest.soundEvents) || !Array.isArray(audioManifest.musicTracks) || !Array.isArray(audioManifest.actionPlayback)) {
    errors.push(createAudioError(
      ENGINE_V2_AUDIO_ERRORS.MANIFEST_INVALID,
      "Engine V2 audio runtime requires audioManifest volumeGroups, soundEvents, musicTracks, and actionPlayback arrays.",
      "audioManifest"
    ));
  }

  if (!Array.isArray(runtimeEvents)) {
    errors.push(createAudioError(
      ENGINE_V2_AUDIO_ERRORS.RUNTIME_EVENTS_INVALID,
      "Engine V2 audio runtime requires runtimeEvents array.",
      "runtimeEvents"
    ));
  }

  if (!Array.isArray(actionOutcomes)) {
    errors.push(createAudioError(
      ENGINE_V2_AUDIO_ERRORS.ACTION_OUTCOMES_INVALID,
      "Engine V2 audio runtime requires actionOutcomes array.",
      "actionOutcomes"
    ));
  }

  if (!isRecord(audioState) || !hasNonEmptyString(audioState.activeSceneId) || !(hasNonEmptyString(audioState.activeMusicId) || audioState.activeMusicId === null)) {
    errors.push(createAudioError(
      ENGINE_V2_AUDIO_ERRORS.AUDIO_STATE_INVALID,
      "Engine V2 audio runtime requires audioState with activeSceneId and activeMusicId string or null.",
      "audioState"
    ));
  }

  if (errors.length > 0) {
    return createAudioResult({ audioState: null, playbackCommands: [], errors });
  }

  validateAudioManifest(audioManifest).forEach((error) => errors.push(error));
  runtimeEvents.forEach((runtimeEvent, index) => {
    validateRuntimeEvent(runtimeEvent, `runtimeEvents[${index}]`).forEach((error) => errors.push(error));
  });
  actionOutcomes.forEach((actionOutcome, index) => {
    validateActionOutcome(actionOutcome, `actionOutcomes[${index}]`).forEach((error) => errors.push(error));
  });

  if (errors.length > 0) {
    return createAudioResult({ audioState: null, playbackCommands: [], errors });
  }

  const volumeGroupsById = new Map(audioManifest.volumeGroups.map((volumeGroup) => [volumeGroup.volumeGroupId, volumeGroup]));
  const playbackCommands = [];

  runtimeEvents.forEach((runtimeEvent) => {
    audioManifest.soundEvents
      .filter((soundEvent) => soundEvent.eventType === runtimeEvent.eventType)
      .forEach((soundEvent) => {
        const volumeGroup = volumeGroupsById.get(soundEvent.volumeGroupId);

        playbackCommands.push(Object.freeze({
          command: "playSound",
          source: "runtimeEvent",
          eventId: runtimeEvent.eventId,
          soundId: soundEvent.soundId,
          volumeGroupId: soundEvent.volumeGroupId,
          volume: volumeGroup.volume,
        }));
      });
  });

  actionOutcomes.forEach((actionOutcome) => {
    audioManifest.actionPlayback
      .filter((playback) => playback.actionType === actionOutcome.actionType)
      .forEach((playback) => {
        const volumeGroup = volumeGroupsById.get(playback.volumeGroupId);

        playbackCommands.push(Object.freeze({
          command: "playSound",
          source: "actionOutcome",
          actionId: actionOutcome.actionId,
          soundId: playback.soundId,
          volumeGroupId: playback.volumeGroupId,
          volume: volumeGroup.volume,
        }));
      });
  });

  const sceneMusic = audioManifest.musicTracks.find((musicTrack) => musicTrack.sceneId === audioState.activeSceneId);
  const nextAudioState = { ...audioState };

  if (sceneMusic && audioState.activeMusicId !== sceneMusic.musicId) {
    const volumeGroup = volumeGroupsById.get(sceneMusic.volumeGroupId);

    playbackCommands.push(Object.freeze({
      command: "playMusic",
      musicId: sceneMusic.musicId,
      volumeGroupId: sceneMusic.volumeGroupId,
      volume: volumeGroup.volume,
      loop: sceneMusic.loop,
    }));
    nextAudioState.activeMusicId = sceneMusic.musicId;
  }

  return createAudioResult({
    audioState: Object.freeze(nextAudioState),
    playbackCommands,
    errors,
  });
}

function validateAudioManifest(audioManifest) {
  const errors = [];

  audioManifest.volumeGroups.forEach((volumeGroup, index) => {
    if (!isRecord(volumeGroup) || !hasNonEmptyString(volumeGroup.volumeGroupId) || !Number.isFinite(volumeGroup.volume) || volumeGroup.volume < 0 || volumeGroup.volume > 1) {
      errors.push(createAudioError(
        ENGINE_V2_AUDIO_ERRORS.VOLUME_GROUP_INVALID,
        "Volume group requires volumeGroupId and volume from 0 to 1.",
        `audioManifest.volumeGroups[${index}]`
      ));
    }
  });

  const volumeGroupIds = new Set(audioManifest.volumeGroups.map((volumeGroup) => volumeGroup.volumeGroupId));

  audioManifest.soundEvents.forEach((soundEvent, index) => {
    if (!isRecord(soundEvent) || !hasNonEmptyString(soundEvent.soundEventId) || !hasNonEmptyString(soundEvent.eventType) || !hasNonEmptyString(soundEvent.soundId) || !hasNonEmptyString(soundEvent.volumeGroupId)) {
      errors.push(createAudioError(
        ENGINE_V2_AUDIO_ERRORS.SOUND_EVENT_INVALID,
        "Sound event requires soundEventId, eventType, soundId, and volumeGroupId.",
        `audioManifest.soundEvents[${index}]`
      ));
      return;
    }

    if (!volumeGroupIds.has(soundEvent.volumeGroupId)) {
      errors.push(createAudioError(
        ENGINE_V2_AUDIO_ERRORS.VOLUME_GROUP_MISSING,
        "Sound event references missing volume group.",
        `audioManifest.soundEvents[${index}].volumeGroupId`
      ));
    }
  });

  audioManifest.musicTracks.forEach((musicTrack, index) => {
    if (!isRecord(musicTrack) || !hasNonEmptyString(musicTrack.musicId) || !hasNonEmptyString(musicTrack.sceneId) || !hasNonEmptyString(musicTrack.volumeGroupId) || typeof musicTrack.loop !== "boolean") {
      errors.push(createAudioError(
        ENGINE_V2_AUDIO_ERRORS.MUSIC_TRACK_INVALID,
        "Music track requires musicId, sceneId, volumeGroupId, and loop.",
        `audioManifest.musicTracks[${index}]`
      ));
      return;
    }

    if (!volumeGroupIds.has(musicTrack.volumeGroupId)) {
      errors.push(createAudioError(
        ENGINE_V2_AUDIO_ERRORS.VOLUME_GROUP_MISSING,
        "Music track references missing volume group.",
        `audioManifest.musicTracks[${index}].volumeGroupId`
      ));
    }
  });

  audioManifest.actionPlayback.forEach((playback, index) => {
    if (!isRecord(playback) || !hasNonEmptyString(playback.actionPlaybackId) || !hasNonEmptyString(playback.actionType) || !hasNonEmptyString(playback.soundId) || !hasNonEmptyString(playback.volumeGroupId)) {
      errors.push(createAudioError(
        ENGINE_V2_AUDIO_ERRORS.ACTION_PLAYBACK_INVALID,
        "Action playback requires actionPlaybackId, actionType, soundId, and volumeGroupId.",
        `audioManifest.actionPlayback[${index}]`
      ));
      return;
    }

    if (!volumeGroupIds.has(playback.volumeGroupId)) {
      errors.push(createAudioError(
        ENGINE_V2_AUDIO_ERRORS.VOLUME_GROUP_MISSING,
        "Action playback references missing volume group.",
        `audioManifest.actionPlayback[${index}].volumeGroupId`
      ));
    }
  });

  return errors;
}

function validateRuntimeEvent(runtimeEvent, path) {
  if (!isRecord(runtimeEvent) || !hasNonEmptyString(runtimeEvent.eventId) || !hasNonEmptyString(runtimeEvent.eventType)) {
    return [createAudioError(
      ENGINE_V2_AUDIO_ERRORS.RUNTIME_EVENT_INVALID,
      "Runtime event requires eventId and eventType.",
      path
    )];
  }

  return [];
}

function validateActionOutcome(actionOutcome, path) {
  if (!isRecord(actionOutcome) || !hasNonEmptyString(actionOutcome.actionId) || !hasNonEmptyString(actionOutcome.actionType)) {
    return [createAudioError(
      ENGINE_V2_AUDIO_ERRORS.ACTION_OUTCOME_INVALID,
      "Action outcome requires actionId and actionType.",
      path
    )];
  }

  return [];
}

function createAudioResult({ audioState, playbackCommands, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    audioState,
    playbackCommands: Object.freeze(playbackCommands),
    errors: Object.freeze(errors),
  });
}

function createAudioError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
