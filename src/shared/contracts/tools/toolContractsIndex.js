/*
Toolbox Aid
David Quesenberry
06/02/2026
toolContractsIndex.js
*/
import {
  createRootCardCoverage,
} from "../toolContractPrimitives.js";
import {
  WORLD_VECTOR_STUDIO_V2_TOOL_CONTRACT,
} from "./worldVectorStudioV2ToolContract.js";
import {
  OBJECT_VECTOR_STUDIO_V2_TOOL_CONTRACT,
} from "./objectVectorStudioV2ToolContract.js";
import {
  TILE_MAP_EDITOR_TOOL_CONTRACT,
} from "./tileMapEditorToolContract.js";
import {
  PARALLAX_EDITOR_TOOL_CONTRACT,
} from "./parallaxEditorToolContract.js";
import {
  SPRITE_EDITOR_TOOL_CONTRACT,
} from "./spriteEditorToolContract.js";
import {
  ASSET_MANAGER_V2_TOOL_CONTRACT,
} from "./assetManagerV2ToolContract.js";
import {
  WORKSPACE_MANAGER_V2_TOOL_CONTRACT,
} from "./workspaceManagerV2ToolContract.js";
import {
  PALETTE_MANAGER_V2_TOOL_CONTRACT,
} from "./paletteManagerV2ToolContract.js";
import {
  PREVIEW_GENERATOR_V2_TOOL_CONTRACT,
} from "./previewGeneratorV2ToolContract.js";
import {
  TEXT2SPEECH_V2_TOOL_CONTRACT,
} from "./text2speechV2ToolContract.js";
import {
  AUDIO_SFX_PLAYGROUND_V2_TOOL_CONTRACT,
} from "./audioSfxPlaygroundV2ToolContract.js";
import {
  MIDI_STUDIO_V2_TOOL_CONTRACT,
} from "./midiStudioV2ToolContract.js";
import {
  COLLISION_INSPECTOR_V2_TOOL_CONTRACT,
} from "./collisionInspectorV2ToolContract.js";
import {
  STORAGE_INSPECTOR_V2_TOOL_CONTRACT,
} from "./storageInspectorV2ToolContract.js";
import {
  INPUT_MAPPING_V2_TOOL_CONTRACT,
} from "./inputMappingV2ToolContract.js";
import {
  STATE_INSPECTOR_TOOL_CONTRACT,
} from "./stateInspectorToolContract.js";
import {
  REPLAY_VISUALIZER_TOOL_CONTRACT,
} from "./replayVisualizerToolContract.js";
import {
  PERFORMANCE_PROFILER_TOOL_CONTRACT,
} from "./performanceProfilerToolContract.js";
import {
  PHYSICS_SANDBOX_TOOL_CONTRACT,
} from "./physicsSandboxToolContract.js";
import {
  ASSET_PIPELINE_TOOL_CONTRACT,
} from "./assetPipelineToolContract.js";
import {
  THREE_D_JSON_PAYLOAD_TOOL_CONTRACT,
} from "./threeDJsonPayloadToolContract.js";
import {
  THREE_D_ASSET_VIEWER_TOOL_CONTRACT,
} from "./threeDAssetViewerToolContract.js";
import {
  THREE_D_CAMERA_PATH_EDITOR_TOOL_CONTRACT,
} from "./threeDCameraPathEditorToolContract.js";
import {
  ASSET_STUDIO_TOOL_CONTRACT,
} from "./assetStudioToolContract.js";
import {
  GAME_BUILDER_TOOL_CONTRACT,
} from "./gameBuilderToolContract.js";
import {
  GAME_DESIGN_STUDIO_TOOL_CONTRACT,
} from "./gameDesignStudioToolContract.js";
import {
  PUBLISH_STUDIO_TOOL_CONTRACT,
} from "./publishStudioToolContract.js";
import {
  ANIMATION_STUDIO_TOOL_CONTRACT,
} from "./animationStudioToolContract.js";
import {
  PARTICLE_STUDIO_TOOL_CONTRACT,
} from "./particleStudioToolContract.js";
import {
  SOUND_STUDIO_TOOL_CONTRACT,
} from "./soundStudioToolContract.js";
import {
  AI_ASSISTANT_TOOL_CONTRACT,
} from "./aiAssistantToolContract.js";
import {
  CODE_STUDIO_TOOL_CONTRACT,
} from "./codeStudioToolContract.js";
import {
  INPUT_STUDIO_TOOL_CONTRACT,
} from "./inputStudioToolContract.js";
import {
  LOCALIZATION_STUDIO_TOOL_CONTRACT,
} from "./localizationStudioToolContract.js";

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
