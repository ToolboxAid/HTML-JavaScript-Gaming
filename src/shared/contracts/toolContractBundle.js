/*
Toolbox Aid
David Quesenberry
06/02/2026
toolContractBundle.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_VISIBILITY_STATES,
  canActorAccessProject,
} from "./projectContract.js";
import {
  TOOL_STATE_FIELDS,
  isToolStateVersion,
} from "./toolStateContract.js";
import {
  ASSET_TYPES,
  isAssetType,
} from "./assetContract.js";

export const TOOL_CONTRACT_BUNDLE_ID = "gamefoundrystudio.tool.contract-bundle";
export const TOOL_CONTRACT_BUNDLE_VERSION = "1.0.0";

export const TOOL_CONTRACT_OWNER_ID = "platform.gamefoundrystudio";
export const TOOL_CONTRACT_PROJECT_ID = "project.gamefoundrystudio.tools";

export const TOOL_CONTRACT_FIELDS = Object.freeze({
  TOOL_ID: "toolId",
  TOOL_TYPE: "toolType",
  OWNER: "ownerId",
  PROJECT: "projectId",
  VISIBILITY: "visibility",
  REQUIRED_INPUTS: "requiredInputs",
  PRODUCED_OUTPUTS: "producedOutputs",
  SOURCE_TOOL_STATE: "sourceToolState",
  SUPPORTED_ASSET_TYPES: "supportedAssetTypes",
  IMPORT_FORMATS: "importFormats",
  EXPORT_FORMATS: "exportFormats",
  STATUS: "status",
  VERSION: "version",
});

export const TOOL_CONTRACT_TYPES = Object.freeze({
  EDITOR: "editor",
  GENERATOR: "generator",
  INSPECTOR: "inspector",
  MANAGER: "manager",
  PIPELINE: "pipeline",
  STUDIO: "studio",
  UTILITY: "utility",
  VIEWER: "viewer",
  WORKSPACE: "workspace",
});

export const TOOL_CONTRACT_TYPE_LIST = Object.freeze([
  TOOL_CONTRACT_TYPES.EDITOR,
  TOOL_CONTRACT_TYPES.GENERATOR,
  TOOL_CONTRACT_TYPES.INSPECTOR,
  TOOL_CONTRACT_TYPES.MANAGER,
  TOOL_CONTRACT_TYPES.PIPELINE,
  TOOL_CONTRACT_TYPES.STUDIO,
  TOOL_CONTRACT_TYPES.UTILITY,
  TOOL_CONTRACT_TYPES.VIEWER,
  TOOL_CONTRACT_TYPES.WORKSPACE,
]);

export const TOOL_CONTRACT_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
});

export const TOOL_CONTRACT_STATUS_LIST = Object.freeze([
  TOOL_CONTRACT_STATUS.DRAFT,
  TOOL_CONTRACT_STATUS.ACTIVE,
  TOOL_CONTRACT_STATUS.ARCHIVED,
]);

export const TOOL_CONTRACT_VISIBILITY_STATES = Object.freeze({
  PRIVATE: PROJECT_VISIBILITY_STATES.PRIVATE,
  PROJECT: PROJECT_VISIBILITY_STATES.PROJECT,
  UNLISTED: PROJECT_VISIBILITY_STATES.UNLISTED,
  PUBLIC: PROJECT_VISIBILITY_STATES.PUBLIC,
  MARKETPLACE: IDENTITY_VISIBILITY_STATES.MARKETPLACE,
});

export const TOOL_CONTRACT_VISIBILITY_LIST = Object.freeze([
  TOOL_CONTRACT_VISIBILITY_STATES.PRIVATE,
  TOOL_CONTRACT_VISIBILITY_STATES.PROJECT,
  TOOL_CONTRACT_VISIBILITY_STATES.UNLISTED,
  TOOL_CONTRACT_VISIBILITY_STATES.PUBLIC,
  TOOL_CONTRACT_VISIBILITY_STATES.MARKETPLACE,
]);

export const TOOL_CONTRACT_FORMATS = Object.freeze({
  ASSET: "asset",
  AUDIO_FILE: "audio-file",
  ANIMATION_JSON: "animation-json",
  CAMERA_PATH_JSON: "camera-path-json",
  CODE_FILE: "code-file",
  COLLISION_REPORT: "collision-report",
  GAME_DESIGN_JSON: "game-design-json",
  GAME_MANIFEST: "game-manifest",
  IMAGE_FILE: "image-file",
  INPUT_MAP: "input-map",
  JSON: "json",
  LOCALIZATION_JSON: "localization-json",
  METADATA_JSON: "metadata-json",
  MIDI_FILE: "midi-file",
  PARTICLE_JSON: "particle-json",
  PHYSICS_CONFIG: "physics-config",
  PREVIEW_SVG: "preview-svg",
  PROJECT_PACKAGE: "project-package",
  PUBLISH_PACKAGE: "publish-package",
  PALETTE_JSON: "palette-json",
  REPLAY_EVENTS: "replay-events",
  STORAGE_SNAPSHOT: "storage-snapshot",
  TEXT: "text",
  THREE_D_JSON: "3d-json",
  TILEMAP_JSON: "tilemap-json",
  TOOL_STATE: "tool-state",
  VECTOR_JSON: "vector-json",
  SVG: "svg",
});

export const TOOL_CONTRACT_FORMAT_LIST = Object.freeze([
  TOOL_CONTRACT_FORMATS.ASSET,
  TOOL_CONTRACT_FORMATS.AUDIO_FILE,
  TOOL_CONTRACT_FORMATS.ANIMATION_JSON,
  TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON,
  TOOL_CONTRACT_FORMATS.CODE_FILE,
  TOOL_CONTRACT_FORMATS.COLLISION_REPORT,
  TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON,
  TOOL_CONTRACT_FORMATS.GAME_MANIFEST,
  TOOL_CONTRACT_FORMATS.IMAGE_FILE,
  TOOL_CONTRACT_FORMATS.INPUT_MAP,
  TOOL_CONTRACT_FORMATS.JSON,
  TOOL_CONTRACT_FORMATS.LOCALIZATION_JSON,
  TOOL_CONTRACT_FORMATS.METADATA_JSON,
  TOOL_CONTRACT_FORMATS.MIDI_FILE,
  TOOL_CONTRACT_FORMATS.PARTICLE_JSON,
  TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG,
  TOOL_CONTRACT_FORMATS.PREVIEW_SVG,
  TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE,
  TOOL_CONTRACT_FORMATS.PUBLISH_PACKAGE,
  TOOL_CONTRACT_FORMATS.PALETTE_JSON,
  TOOL_CONTRACT_FORMATS.REPLAY_EVENTS,
  TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT,
  TOOL_CONTRACT_FORMATS.TEXT,
  TOOL_CONTRACT_FORMATS.THREE_D_JSON,
  TOOL_CONTRACT_FORMATS.TILEMAP_JSON,
  TOOL_CONTRACT_FORMATS.TOOL_STATE,
  TOOL_CONTRACT_FORMATS.VECTOR_JSON,
  TOOL_CONTRACT_FORMATS.SVG,
]);

export const TOOL_CONTRACT_PORTABLE_EXPORT_FIELDS = Object.freeze([
  TOOL_CONTRACT_FIELDS.TOOL_ID,
  TOOL_CONTRACT_FIELDS.TOOL_TYPE,
  TOOL_CONTRACT_FIELDS.VISIBILITY,
  TOOL_CONTRACT_FIELDS.REQUIRED_INPUTS,
  TOOL_CONTRACT_FIELDS.PRODUCED_OUTPUTS,
  TOOL_CONTRACT_FIELDS.SOURCE_TOOL_STATE,
  TOOL_CONTRACT_FIELDS.SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_FIELDS.IMPORT_FORMATS,
  TOOL_CONTRACT_FIELDS.EXPORT_FORMATS,
  TOOL_CONTRACT_FIELDS.STATUS,
  TOOL_CONTRACT_FIELDS.VERSION,
]);

export const TOOL_CONTRACT_ERRORS = Object.freeze({
  TOOL_ID_REQUIRED: "TOOL_CONTRACT_TOOL_ID_REQUIRED",
  TOOL_TYPE_REQUIRED: "TOOL_CONTRACT_TOOL_TYPE_REQUIRED",
  TOOL_TYPE_INVALID: "TOOL_CONTRACT_TOOL_TYPE_INVALID",
  OWNER_REQUIRED: "TOOL_CONTRACT_OWNER_REQUIRED",
  PROJECT_REQUIRED: "TOOL_CONTRACT_PROJECT_REQUIRED",
  VISIBILITY_REQUIRED: "TOOL_CONTRACT_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "TOOL_CONTRACT_VISIBILITY_INVALID",
  REQUIRED_INPUTS_INVALID: "TOOL_CONTRACT_REQUIRED_INPUTS_INVALID",
  PRODUCED_OUTPUTS_REQUIRED: "TOOL_CONTRACT_PRODUCED_OUTPUTS_REQUIRED",
  PRODUCED_OUTPUT_INVALID: "TOOL_CONTRACT_PRODUCED_OUTPUT_INVALID",
  SOURCE_TOOL_STATE_INVALID: "TOOL_CONTRACT_SOURCE_TOOL_STATE_INVALID",
  SOURCE_TOOL_STATE_PROJECT_MISMATCH: "TOOL_CONTRACT_SOURCE_TOOL_STATE_PROJECT_MISMATCH",
  SUPPORTED_ASSET_TYPE_INVALID: "TOOL_CONTRACT_SUPPORTED_ASSET_TYPE_INVALID",
  IMPORT_FORMAT_INVALID: "TOOL_CONTRACT_IMPORT_FORMAT_INVALID",
  EXPORT_FORMATS_REQUIRED: "TOOL_CONTRACT_EXPORT_FORMATS_REQUIRED",
  EXPORT_FORMAT_INVALID: "TOOL_CONTRACT_EXPORT_FORMAT_INVALID",
  STATUS_REQUIRED: "TOOL_CONTRACT_STATUS_REQUIRED",
  STATUS_INVALID: "TOOL_CONTRACT_STATUS_INVALID",
  VERSION_REQUIRED: "TOOL_CONTRACT_VERSION_REQUIRED",
  VERSION_INVALID: "TOOL_CONTRACT_VERSION_INVALID",
  PORTABLE_EXPORT_INVALID: "TOOL_CONTRACT_PORTABLE_EXPORT_INVALID",
});

export const TOOL_CONTRACT_LIST = Object.freeze([
  createToolContract({
    toolId: "world-vector-studio-v2",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.ASSET, TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.TILEMAP_JSON],
    supportedAssetTypes: [ASSET_TYPES.VECTOR, ASSET_TYPES.TILEMAP, ASSET_TYPES.IMAGE],
    importFormats: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.TILEMAP_JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.TILEMAP_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  }),
  createToolContract({
    toolId: "object-vector-studio-v2",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.SVG],
    supportedAssetTypes: [ASSET_TYPES.VECTOR, ASSET_TYPES.PALETTE],
    importFormats: [TOOL_CONTRACT_FORMATS.PALETTE_JSON, TOOL_CONTRACT_FORMATS.VECTOR_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.SVG, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  }),
  createToolContract({
    toolId: "tile-map-editor",
    toolType: TOOL_CONTRACT_TYPES.EDITOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.TILEMAP_JSON],
    supportedAssetTypes: [ASSET_TYPES.TILEMAP, ASSET_TYPES.IMAGE, ASSET_TYPES.PALETTE],
    importFormats: [TOOL_CONTRACT_FORMATS.TILEMAP_JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.TILEMAP_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  }),
  createToolContract({
    toolId: "parallax-editor",
    toolType: TOOL_CONTRACT_TYPES.EDITOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    producedOutputs: [TOOL_CONTRACT_FORMATS.JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    supportedAssetTypes: [ASSET_TYPES.IMAGE],
    importFormats: [TOOL_CONTRACT_FORMATS.JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  }),
  createToolContract({
    toolId: "sprite-editor",
    toolType: TOOL_CONTRACT_TYPES.EDITOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
    supportedAssetTypes: [ASSET_TYPES.IMAGE, ASSET_TYPES.PALETTE],
    importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "asset-manager-v2",
    toolType: TOOL_CONTRACT_TYPES.MANAGER,
    requiredInputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON, TOOL_CONTRACT_FORMATS.METADATA_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
    supportedAssetTypes: Object.values(ASSET_TYPES),
    importFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.ASSET],
    exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  }),
  createToolContract({
    toolId: "workspace-manager-v2",
    toolType: TOOL_CONTRACT_TYPES.WORKSPACE,
    requiredInputs: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST],
    producedOutputs: [TOOL_CONTRACT_FORMATS.TOOL_STATE, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
    supportedAssetTypes: Object.values(ASSET_TYPES),
    importFormats: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.TOOL_STATE],
    exportFormats: [TOOL_CONTRACT_FORMATS.TOOL_STATE, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  }),
  createToolContract({
    toolId: "palette-manager-v2",
    toolType: TOOL_CONTRACT_TYPES.MANAGER,
    requiredInputs: [],
    producedOutputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    supportedAssetTypes: [ASSET_TYPES.PALETTE],
    importFormats: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.PALETTE_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  }),
  createToolContract({
    toolId: "preview-generator-v2",
    toolType: TOOL_CONTRACT_TYPES.GENERATOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.PREVIEW_SVG],
    supportedAssetTypes: [ASSET_TYPES.IMAGE, ASSET_TYPES.VECTOR],
    importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.PREVIEW_SVG],
  }),
  createToolContract({
    toolId: "text2speech-V2",
    toolType: TOOL_CONTRACT_TYPES.GENERATOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
    producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
    supportedAssetTypes: [ASSET_TYPES.AUDIO],
    importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
    exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "audio-sfx-playground-v2",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [],
    producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
    supportedAssetTypes: [ASSET_TYPES.AUDIO],
    importFormats: [TOOL_CONTRACT_FORMATS.JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "midi-studio-v2",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.MIDI_FILE],
    producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
    supportedAssetTypes: [ASSET_TYPES.AUDIO],
    importFormats: [TOOL_CONTRACT_FORMATS.MIDI_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "collision-inspector-v2",
    toolType: TOOL_CONTRACT_TYPES.INSPECTOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    producedOutputs: [TOOL_CONTRACT_FORMATS.COLLISION_REPORT],
    supportedAssetTypes: [ASSET_TYPES.VECTOR, ASSET_TYPES.IMAGE],
    importFormats: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.COLLISION_REPORT, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "storage-inspector-v2",
    toolType: TOOL_CONTRACT_TYPES.INSPECTOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT],
    producedOutputs: [TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT],
    exportFormats: [TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "input-mapping-v2",
    toolType: TOOL_CONTRACT_TYPES.UTILITY,
    requiredInputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
    producedOutputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
    exportFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  }),
  createToolContract({
    toolId: "state-inspector",
    toolType: TOOL_CONTRACT_TYPES.INSPECTOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.TOOL_STATE, TOOL_CONTRACT_FORMATS.JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.TOOL_STATE, TOOL_CONTRACT_FORMATS.JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "replay-visualizer",
    toolType: TOOL_CONTRACT_TYPES.VIEWER,
    requiredInputs: [TOOL_CONTRACT_FORMATS.REPLAY_EVENTS],
    producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.REPLAY_EVENTS],
    exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "performance-profiler",
    toolType: TOOL_CONTRACT_TYPES.INSPECTOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "physics-sandbox",
    toolType: TOOL_CONTRACT_TYPES.UTILITY,
    requiredInputs: [TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG],
    producedOutputs: [TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG],
    exportFormats: [TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "asset-pipeline",
    toolType: TOOL_CONTRACT_TYPES.PIPELINE,
    requiredInputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.ASSET],
    producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
    supportedAssetTypes: Object.values(ASSET_TYPES),
    importFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.ASSET],
    exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  }),
  createToolContract({
    toolId: "3d-json-payload",
    toolType: TOOL_CONTRACT_TYPES.UTILITY,
    requiredInputs: [TOOL_CONTRACT_FORMATS.THREE_D_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.THREE_D_JSON],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.THREE_D_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.THREE_D_JSON],
  }),
  createToolContract({
    toolId: "3d-asset-viewer",
    toolType: TOOL_CONTRACT_TYPES.VIEWER,
    requiredInputs: [TOOL_CONTRACT_FORMATS.THREE_D_JSON, TOOL_CONTRACT_FORMATS.METADATA_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.THREE_D_JSON, TOOL_CONTRACT_FORMATS.METADATA_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
  }),
  createToolContract({
    toolId: "3d-camera-path-editor",
    toolType: TOOL_CONTRACT_TYPES.EDITOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON],
  }),
  createToolContract({
    toolId: "asset-studio",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    supportedAssetTypes: [ASSET_TYPES.IMAGE, ASSET_TYPES.VECTOR, ASSET_TYPES.PALETTE],
    importFormats: [TOOL_CONTRACT_FORMATS.PALETTE_JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.PALETTE_JSON],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "game-builder",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON, TOOL_CONTRACT_FORMATS.ASSET],
    producedOutputs: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST],
    supportedAssetTypes: Object.values(ASSET_TYPES),
    importFormats: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON, TOOL_CONTRACT_FORMATS.ASSET],
    exportFormats: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "game-design-studio",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
    producedOutputs: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
    exportFormats: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "publish-studio",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.METADATA_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.PUBLISH_PACKAGE],
    supportedAssetTypes: Object.values(ASSET_TYPES),
    importFormats: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.METADATA_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.PUBLISH_PACKAGE, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "animation-studio",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    producedOutputs: [TOOL_CONTRACT_FORMATS.ANIMATION_JSON],
    supportedAssetTypes: [ASSET_TYPES.IMAGE],
    importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.ANIMATION_JSON],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "particle-studio",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.VECTOR_JSON],
    producedOutputs: [TOOL_CONTRACT_FORMATS.PARTICLE_JSON],
    supportedAssetTypes: [ASSET_TYPES.IMAGE, ASSET_TYPES.VECTOR],
    importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.VECTOR_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.PARTICLE_JSON],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "sound-studio",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [],
    producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
    supportedAssetTypes: [ASSET_TYPES.AUDIO],
    importFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "ai-assistant",
    toolType: TOOL_CONTRACT_TYPES.UTILITY,
    requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
    producedOutputs: [TOOL_CONTRACT_FORMATS.TEXT],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
    exportFormats: [TOOL_CONTRACT_FORMATS.TEXT],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "code-studio",
    toolType: TOOL_CONTRACT_TYPES.EDITOR,
    requiredInputs: [TOOL_CONTRACT_FORMATS.CODE_FILE],
    producedOutputs: [TOOL_CONTRACT_FORMATS.CODE_FILE],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.CODE_FILE],
    exportFormats: [TOOL_CONTRACT_FORMATS.CODE_FILE],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "input-studio",
    toolType: TOOL_CONTRACT_TYPES.UTILITY,
    requiredInputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
    producedOutputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
    supportedAssetTypes: [],
    importFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
    exportFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
  createToolContract({
    toolId: "localization-studio",
    toolType: TOOL_CONTRACT_TYPES.STUDIO,
    requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
    producedOutputs: [TOOL_CONTRACT_FORMATS.LOCALIZATION_JSON],
    supportedAssetTypes: [ASSET_TYPES.LOCALIZATION],
    importFormats: [TOOL_CONTRACT_FORMATS.TEXT, TOOL_CONTRACT_FORMATS.LOCALIZATION_JSON],
    exportFormats: [TOOL_CONTRACT_FORMATS.LOCALIZATION_JSON],
    status: TOOL_CONTRACT_STATUS.DRAFT,
  }),
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

export function isToolContractType(value) {
  return TOOL_CONTRACT_TYPE_LIST.includes(value);
}

export function isToolContractStatus(value) {
  return TOOL_CONTRACT_STATUS_LIST.includes(value);
}

export function isToolContractVisibility(value) {
  return TOOL_CONTRACT_VISIBILITY_LIST.includes(value);
}

export function isToolContractVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isToolContractFormat(value) {
  return TOOL_CONTRACT_FORMAT_LIST.includes(value);
}

export function validateToolContract(toolContract, { saved = true } = {}) {
  const errors = [];

  if (!hasNonEmptyString(toolContract?.toolId)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.TOOL_ID_REQUIRED,
      "Tool contracts require toolId.",
      "toolId"
    ));
  }

  if (!hasNonEmptyString(toolContract?.toolType)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.TOOL_TYPE_REQUIRED,
      "Tool contracts require toolType.",
      "toolType"
    ));
  } else if (!isToolContractType(toolContract.toolType)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.TOOL_TYPE_INVALID,
      "Tool contract toolType must be an allowed tool contract type.",
      "toolType"
    ));
  }

  if (saved && !hasNonEmptyString(toolContract?.ownerId)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Saved tool contracts require ownerId.",
      "ownerId"
    ));
  }

  if (saved && !hasNonEmptyString(toolContract?.projectId)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Saved tool contracts require projectId.",
      "projectId"
    ));
  }

  if (!hasNonEmptyString(toolContract?.visibility)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Tool contracts require explicit visibility.",
      "visibility"
    ));
  } else if (!isToolContractVisibility(toolContract.visibility)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Tool contract visibility must be an allowed visibility state.",
      "visibility"
    ));
  }

  validateFormatList(toolContract?.requiredInputs, TOOL_CONTRACT_ERRORS.REQUIRED_INPUTS_INVALID, "requiredInputs", errors, false);
  validateFormatList(toolContract?.producedOutputs, TOOL_CONTRACT_ERRORS.PRODUCED_OUTPUTS_REQUIRED, "producedOutputs", errors, true, TOOL_CONTRACT_ERRORS.PRODUCED_OUTPUT_INVALID);

  if (toolContract?.sourceToolState !== undefined && toolContract.sourceToolState !== null) {
    validateSourceToolState(toolContract, errors);
  }

  if (!Array.isArray(toolContract?.supportedAssetTypes)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.SUPPORTED_ASSET_TYPE_INVALID,
      "Tool contracts must declare supportedAssetTypes as an array.",
      "supportedAssetTypes"
    ));
  } else {
    toolContract.supportedAssetTypes.forEach((assetType, index) => {
      if (!isAssetType(assetType)) {
        errors.push(createContractError(
          TOOL_CONTRACT_ERRORS.SUPPORTED_ASSET_TYPE_INVALID,
          "Tool contract supportedAssetTypes must use allowed asset types.",
          `supportedAssetTypes[${index}]`
        ));
      }
    });
  }

  validateFormatList(toolContract?.importFormats, TOOL_CONTRACT_ERRORS.IMPORT_FORMAT_INVALID, "importFormats", errors, false);
  validateFormatList(toolContract?.exportFormats, TOOL_CONTRACT_ERRORS.EXPORT_FORMATS_REQUIRED, "exportFormats", errors, true, TOOL_CONTRACT_ERRORS.EXPORT_FORMAT_INVALID);

  if (!hasNonEmptyString(toolContract?.status)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Tool contracts require status.",
      "status"
    ));
  } else if (!isToolContractStatus(toolContract.status)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.STATUS_INVALID,
      "Tool contract status must be an allowed tool contract status.",
      "status"
    ));
  }

  if (toolContract?.version === undefined || toolContract?.version === null) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.VERSION_REQUIRED,
      "Tool contracts require version.",
      "version"
    ));
  } else if (!isToolContractVersion(toolContract.version)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.VERSION_INVALID,
      "Tool contract version must be a positive integer.",
      "version"
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function toolStateLinksToToolContract(toolState, toolContract) {
  if (!toolState || !toolContract) {
    return false;
  }

  return hasNonEmptyString(toolState[TOOL_STATE_FIELDS.TOOL_STATE_ID])
    && toolState[TOOL_STATE_FIELDS.TOOL_TYPE] === toolContract.toolId;
}

export function canEditToolContractStatus(toolContract, policy = {}) {
  if (toolContract?.status === TOOL_CONTRACT_STATUS.ARCHIVED) {
    return policy.allowArchivedToolOutputEdit === true;
  }

  return isToolContractStatus(toolContract?.status);
}

export function isToolContractVisibleToActor({
  actorId,
  toolContract,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !toolContract) {
    return false;
  }

  if (actorId === toolContract.ownerId) {
    return true;
  }

  if (toolContract.visibility === TOOL_CONTRACT_VISIBILITY_STATES.PUBLIC
    || toolContract.visibility === TOOL_CONTRACT_VISIBILITY_STATES.UNLISTED
    || toolContract.visibility === TOOL_CONTRACT_VISIBILITY_STATES.MARKETPLACE) {
    return true;
  }

  if (!project || toolContract.projectId !== project.id) {
    return false;
  }

  return canActorAccessProject({
    actorId,
    projectRole: PROJECT_ROLES.VIEWER,
    permission: IDENTITY_PERMISSIONS.VIEW,
    project,
    grantedProjectIds,
  });
}

export function canActorAccessToolContract({
  actorId,
  projectRole,
  permission,
  toolContract,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isToolContractVisibleToActor({ actorId, toolContract, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditToolContractStatus(toolContract, policy)) {
    return false;
  }

  if (actorId === toolContract?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: toolContract.ownerId,
        visibility: toolContract.visibility,
      },
    });
  }

  return canActorAccessProject({
    actorId,
    projectRole,
    permission,
    project,
    grantedProjectIds,
    grantedScopes,
    policy,
  });
}

export function createPortableToolContractExport(toolContract) {
  const validation = validateToolContract(toolContract);

  if (!validation.valid) {
    return Object.freeze({
      valid: false,
      errors: validation.errors,
      export: null,
    });
  }

  const portableExport = Object.freeze({
    contractId: TOOL_CONTRACT_BUNDLE_ID,
    contractVersion: TOOL_CONTRACT_BUNDLE_VERSION,
    toolId: toolContract.toolId,
    toolType: toolContract.toolType,
    visibility: toolContract.visibility,
    requiredInputs: Object.freeze(cloneJsonData(toolContract.requiredInputs)),
    producedOutputs: Object.freeze(cloneJsonData(toolContract.producedOutputs)),
    sourceToolState: createPortableSourceToolState(toolContract.sourceToolState),
    supportedAssetTypes: Object.freeze(cloneJsonData(toolContract.supportedAssetTypes)),
    importFormats: Object.freeze(cloneJsonData(toolContract.importFormats)),
    exportFormats: Object.freeze(cloneJsonData(toolContract.exportFormats)),
    status: toolContract.status,
    version: toolContract.version,
    portable: true,
  });

  return Object.freeze({
    valid: true,
    errors: Object.freeze([]),
    export: portableExport,
  });
}

export function validatePortableToolContractExport(portableExport) {
  const errors = [];

  if (!portableExport?.portable) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable tool contract export must declare portable=true.",
      "portable"
    ));
  }

  if (hasNonEmptyString(portableExport?.ownerId) || hasNonEmptyString(portableExport?.projectId) || hasNonEmptyString(portableExport?.databaseId)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable tool contract export must not carry database owner, project, or database ids.",
      "portable"
    ));
  }

  const portableContract = {
    ...portableExport,
    ownerId: TOOL_CONTRACT_OWNER_ID,
    projectId: TOOL_CONTRACT_PROJECT_ID,
  };
  const validation = validateToolContract(portableContract);

  validation.errors.forEach((error) => {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      error.message,
      error.path
    ));
  });

  if (portableExport?.sourceToolState && (hasNonEmptyString(portableExport.sourceToolState.ownerId) || hasNonEmptyString(portableExport.sourceToolState.projectId))) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable source tool state references must not carry owner or project ids.",
      "sourceToolState"
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

function createToolContract({
  toolId,
  toolType,
  requiredInputs,
  producedOutputs,
  supportedAssetTypes,
  importFormats,
  exportFormats,
  status = TOOL_CONTRACT_STATUS.ACTIVE,
  visibility = TOOL_CONTRACT_VISIBILITY_STATES.PUBLIC,
  version = 1,
}) {
  return Object.freeze({
    toolId,
    toolType,
    ownerId: TOOL_CONTRACT_OWNER_ID,
    projectId: TOOL_CONTRACT_PROJECT_ID,
    visibility,
    requiredInputs: Object.freeze(requiredInputs),
    producedOutputs: Object.freeze(producedOutputs),
    sourceToolState: null,
    supportedAssetTypes: Object.freeze(supportedAssetTypes),
    importFormats: Object.freeze(importFormats),
    exportFormats: Object.freeze(exportFormats),
    status,
    version,
  });
}

function createRootCardCoverage(title, contractId, status, reason) {
  return Object.freeze({ title, contractId, status, reason });
}

function validateSourceToolState(toolContract, errors) {
  const sourceToolState = toolContract.sourceToolState;

  if (!sourceToolState || typeof sourceToolState !== "object") {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Tool contract sourceToolState must be an object when provided.",
      "sourceToolState"
    ));
    return;
  }

  if (!hasNonEmptyString(sourceToolState[TOOL_STATE_FIELDS.TOOL_STATE_ID]) || !hasNonEmptyString(sourceToolState[TOOL_STATE_FIELDS.TOOL_TYPE])) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Tool contract sourceToolState must identify toolStateId and toolType.",
      "sourceToolState"
    ));
  }

  if (sourceToolState.version !== undefined && !isToolStateVersion(sourceToolState.version)) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Tool contract sourceToolState version must be a positive integer when provided.",
      "sourceToolState.version"
    ));
  }

  if (hasNonEmptyString(sourceToolState.projectId) && sourceToolState.projectId !== toolContract.projectId) {
    errors.push(createContractError(
      TOOL_CONTRACT_ERRORS.SOURCE_TOOL_STATE_PROJECT_MISMATCH,
      "Tool contract sourceToolState projectId must match tool contract projectId.",
      "sourceToolState.projectId"
    ));
  }
}

function validateFormatList(value, requiredCode, path, errors, requiresValue, invalidCode = requiredCode) {
  if (!Array.isArray(value)) {
    errors.push(createContractError(
      requiredCode,
      "Tool contract format fields must be arrays.",
      path
    ));
    return;
  }

  if (requiresValue && value.length === 0) {
    errors.push(createContractError(
      requiredCode,
      "Tool contract format fields require at least one entry.",
      path
    ));
    return;
  }

  value.forEach((format, index) => {
    if (!isToolContractFormat(format)) {
      errors.push(createContractError(
        invalidCode,
        "Tool contract formats must use allowed format values.",
        `${path}[${index}]`
      ));
    }
  });
}

function createPortableSourceToolState(sourceToolState) {
  if (!sourceToolState) {
    return null;
  }

  return Object.freeze({
    toolStateId: sourceToolState.toolStateId,
    toolType: sourceToolState.toolType,
    version: sourceToolState.version,
  });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function cloneJsonData(value) {
  return JSON.parse(JSON.stringify(value));
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
