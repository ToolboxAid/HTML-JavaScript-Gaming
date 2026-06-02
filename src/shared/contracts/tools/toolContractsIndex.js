/*
Toolbox Aid
David Quesenberry
06/02/2026
toolContractsIndex.js
*/
import {
  createRootCardCoverage,
} from "./toolContract.js";
import {
  WORLD_VECTOR_STUDIO_V2_TOOL_CONTRACT,
} from "./worldVectorStudioContract.js";
import {
  OBJECT_VECTOR_STUDIO_V2_TOOL_CONTRACT,
} from "./objectVectorStudioContract.js";
import {
  TILE_MAP_EDITOR_TOOL_CONTRACT,
} from "./tileMapEditorContract.js";
import {
  PARALLAX_EDITOR_TOOL_CONTRACT,
} from "./parallaxEditorContract.js";
import {
  SPRITE_EDITOR_TOOL_CONTRACT,
} from "./spriteEditorContract.js";
import {
  ASSET_MANAGER_V2_TOOL_CONTRACT,
} from "./assetManagerContract.js";
import {
  WORKSPACE_MANAGER_V2_TOOL_CONTRACT,
} from "./workspaceManagerContract.js";
import {
  PALETTE_MANAGER_V2_TOOL_CONTRACT,
} from "./paletteManagerContract.js";
import {
  PREVIEW_GENERATOR_V2_TOOL_CONTRACT,
} from "./previewGeneratorContract.js";
import {
  TEXT2SPEECH_V2_TOOL_CONTRACT,
} from "./textToSpeechContract.js";
import {
  AUDIO_SFX_PLAYGROUND_V2_TOOL_CONTRACT,
} from "./audioSfxPlaygroundContract.js";
import {
  MIDI_STUDIO_V2_TOOL_CONTRACT,
} from "./midiStudioContract.js";
import {
  COLLISION_INSPECTOR_V2_TOOL_CONTRACT,
} from "./collisionInspectorContract.js";
import {
  STORAGE_INSPECTOR_V2_TOOL_CONTRACT,
} from "./storageInspectorContract.js";
import {
  INPUT_MAPPING_V2_TOOL_CONTRACT,
} from "./inputMappingContract.js";
import {
  STATE_INSPECTOR_TOOL_CONTRACT,
} from "./stateInspectorContract.js";
import {
  REPLAY_VISUALIZER_TOOL_CONTRACT,
} from "./replayVisualizerContract.js";
import {
  PERFORMANCE_PROFILER_TOOL_CONTRACT,
} from "./performanceProfilerContract.js";
import {
  PHYSICS_SANDBOX_TOOL_CONTRACT,
} from "./physicsSandboxContract.js";
import {
  ASSET_PIPELINE_TOOL_CONTRACT,
} from "./assetPipelineContract.js";
import {
  THREE_D_JSON_PAYLOAD_TOOL_CONTRACT,
} from "./threeDJsonPayloadContract.js";
import {
  THREE_D_ASSET_VIEWER_TOOL_CONTRACT,
} from "./threeDAssetViewerContract.js";
import {
  THREE_D_CAMERA_PATH_EDITOR_TOOL_CONTRACT,
} from "./threeDCameraPathEditorContract.js";
import {
  ASSET_STUDIO_TOOL_CONTRACT,
} from "./assetStudioContract.js";
import {
  GAME_BUILDER_TOOL_CONTRACT,
} from "./gameBuilderContract.js";
import {
  GAME_DESIGN_STUDIO_TOOL_CONTRACT,
} from "./gameDesignStudioContract.js";
import {
  PUBLISH_STUDIO_TOOL_CONTRACT,
} from "./publishStudioContract.js";
import {
  ANIMATION_STUDIO_TOOL_CONTRACT,
} from "./animationStudioContract.js";
import {
  PARTICLE_STUDIO_TOOL_CONTRACT,
} from "./particleStudioContract.js";
import {
  SOUND_STUDIO_TOOL_CONTRACT,
} from "./soundStudioContract.js";
import {
  AI_ASSISTANT_TOOL_CONTRACT,
} from "./aiAssistantContract.js";
import {
  CODE_STUDIO_TOOL_CONTRACT,
} from "./codeStudioContract.js";
import {
  INPUT_STUDIO_TOOL_CONTRACT,
} from "./inputStudioContract.js";
import {
  LOCALIZATION_STUDIO_TOOL_CONTRACT,
} from "./localizationStudioContract.js";

export {
  AI_ASSISTANT_TOOL_CONTRACT,
  ANIMATION_STUDIO_TOOL_CONTRACT,
  ASSET_MANAGER_V2_TOOL_CONTRACT,
  ASSET_PIPELINE_TOOL_CONTRACT,
  ASSET_STUDIO_TOOL_CONTRACT,
  AUDIO_SFX_PLAYGROUND_V2_TOOL_CONTRACT,
  CODE_STUDIO_TOOL_CONTRACT,
  COLLISION_INSPECTOR_V2_TOOL_CONTRACT,
  GAME_BUILDER_TOOL_CONTRACT,
  GAME_DESIGN_STUDIO_TOOL_CONTRACT,
  INPUT_MAPPING_V2_TOOL_CONTRACT,
  INPUT_STUDIO_TOOL_CONTRACT,
  LOCALIZATION_STUDIO_TOOL_CONTRACT,
  MIDI_STUDIO_V2_TOOL_CONTRACT,
  OBJECT_VECTOR_STUDIO_V2_TOOL_CONTRACT,
  PALETTE_MANAGER_V2_TOOL_CONTRACT,
  PARALLAX_EDITOR_TOOL_CONTRACT,
  PARTICLE_STUDIO_TOOL_CONTRACT,
  PERFORMANCE_PROFILER_TOOL_CONTRACT,
  PHYSICS_SANDBOX_TOOL_CONTRACT,
  PREVIEW_GENERATOR_V2_TOOL_CONTRACT,
  PUBLISH_STUDIO_TOOL_CONTRACT,
  REPLAY_VISUALIZER_TOOL_CONTRACT,
  SOUND_STUDIO_TOOL_CONTRACT,
  SPRITE_EDITOR_TOOL_CONTRACT,
  STATE_INSPECTOR_TOOL_CONTRACT,
  STORAGE_INSPECTOR_V2_TOOL_CONTRACT,
  TEXT2SPEECH_V2_TOOL_CONTRACT,
  THREE_D_ASSET_VIEWER_TOOL_CONTRACT,
  THREE_D_CAMERA_PATH_EDITOR_TOOL_CONTRACT,
  THREE_D_JSON_PAYLOAD_TOOL_CONTRACT,
  TILE_MAP_EDITOR_TOOL_CONTRACT,
  WORKSPACE_MANAGER_V2_TOOL_CONTRACT,
  WORLD_VECTOR_STUDIO_V2_TOOL_CONTRACT,
};

export const TOOL_CONTRACT_LIST = Object.freeze([
  WORLD_VECTOR_STUDIO_V2_TOOL_CONTRACT,
  OBJECT_VECTOR_STUDIO_V2_TOOL_CONTRACT,
  TILE_MAP_EDITOR_TOOL_CONTRACT,
  PARALLAX_EDITOR_TOOL_CONTRACT,
  SPRITE_EDITOR_TOOL_CONTRACT,
  ASSET_MANAGER_V2_TOOL_CONTRACT,
  WORKSPACE_MANAGER_V2_TOOL_CONTRACT,
  PALETTE_MANAGER_V2_TOOL_CONTRACT,
  PREVIEW_GENERATOR_V2_TOOL_CONTRACT,
  TEXT2SPEECH_V2_TOOL_CONTRACT,
  AUDIO_SFX_PLAYGROUND_V2_TOOL_CONTRACT,
  MIDI_STUDIO_V2_TOOL_CONTRACT,
  COLLISION_INSPECTOR_V2_TOOL_CONTRACT,
  STORAGE_INSPECTOR_V2_TOOL_CONTRACT,
  INPUT_MAPPING_V2_TOOL_CONTRACT,
  STATE_INSPECTOR_TOOL_CONTRACT,
  REPLAY_VISUALIZER_TOOL_CONTRACT,
  PERFORMANCE_PROFILER_TOOL_CONTRACT,
  PHYSICS_SANDBOX_TOOL_CONTRACT,
  ASSET_PIPELINE_TOOL_CONTRACT,
  THREE_D_JSON_PAYLOAD_TOOL_CONTRACT,
  THREE_D_ASSET_VIEWER_TOOL_CONTRACT,
  THREE_D_CAMERA_PATH_EDITOR_TOOL_CONTRACT,
  ASSET_STUDIO_TOOL_CONTRACT,
  GAME_BUILDER_TOOL_CONTRACT,
  GAME_DESIGN_STUDIO_TOOL_CONTRACT,
  PUBLISH_STUDIO_TOOL_CONTRACT,
  ANIMATION_STUDIO_TOOL_CONTRACT,
  PARTICLE_STUDIO_TOOL_CONTRACT,
  SOUND_STUDIO_TOOL_CONTRACT,
  AI_ASSISTANT_TOOL_CONTRACT,
  CODE_STUDIO_TOOL_CONTRACT,
  INPUT_STUDIO_TOOL_CONTRACT,
  LOCALIZATION_STUDIO_TOOL_CONTRACT,
]);

export const TOOL_INDEX_ROOT_CARD_COVERAGE = Object.freeze([
  createRootCardCoverage("Asset Studio", "asset-studio", "contracted", ""),
  createRootCardCoverage("Object Vector Studio", "object-vector-studio-v2", "mapped", "Root card links object-vector-studio.html; first-class contract is object-vector-studio-v2."),
  createRootCardCoverage("World Vector Studio", "world-vector-studio-v2", "mapped", "Root card links world-vector-studio.html; first-class contract is world-vector-studio-v2."),
  createRootCardCoverage("Palette Manager", "palette-manager-v2", "mapped", "Root card links palette-manager.html; first-class contract is palette-manager-v2."),
  createRootCardCoverage("Game Builder", "game-builder", "contracted", ""),
  createRootCardCoverage("Game Design Studio", "game-design-studio", "contracted", ""),
  createRootCardCoverage("Publish Studio", "publish-studio", "contracted", ""),
  createRootCardCoverage("Animation Studio", "animation-studio", "contracted", ""),
  createRootCardCoverage("Particle Studio", "particle-studio", "contracted", ""),
  createRootCardCoverage("MIDI Studio", "midi-studio-v2", "mapped", "Root card links midi-studio.html; first-class contract is midi-studio-v2."),
  createRootCardCoverage("Sound Studio", "sound-studio", "contracted", ""),
  createRootCardCoverage("AI Assistant", "ai-assistant", "contracted", ""),
  createRootCardCoverage("Code Studio", "code-studio", "contracted", ""),
  createRootCardCoverage("Input Studio", "input-studio", "contracted", ""),
  createRootCardCoverage("Marketplace", "", "skipped", "Tools Index card targets marketplace/index.html, which is a marketplace page rather than a first-class tool contract."),
  createRootCardCoverage("Localization Studio", "localization-studio", "contracted", ""),
  createRootCardCoverage("Arcade", "", "skipped", "Tools Index card targets arcade/index.html, which is a play surface rather than a first-class tool contract."),
  createRootCardCoverage("Storage Inspector", "storage-inspector-v2", "mapped", "Root card links storage-inspector.html; first-class contract is storage-inspector-v2."),
]);

export function getToolContractById(toolId) {
  const normalizedToolId = typeof toolId === "string" ? toolId.trim() : "";
  return TOOL_CONTRACT_LIST.find((contract) => contract.toolId === normalizedToolId) ?? null;
}
