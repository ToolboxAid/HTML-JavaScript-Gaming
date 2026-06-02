/*
Toolbox Aid
David Quesenberry
06/02/2026
PaletteContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  isIdentityPermission,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_VISIBILITY_STATES,
  isProjectVisibility,
} from "../../src/shared/contracts/projectContract.js";
import {
  TOOL_STATE_FIELDS,
  isToolStateVersion,
} from "../../src/shared/contracts/toolStateContract.js";
import {
  PALETTE_CONTRACT_ERRORS,
  PALETTE_CONTRACT_ID,
  PALETTE_CONTRACT_VERSION,
  PALETTE_EXPORT_FORMAT_LIST,
  PALETTE_EXPORT_FORMATS,
  PALETTE_FIELDS,
  PALETTE_PORTABLE_EXPORT_FIELDS,
  PALETTE_STATUS,
  PALETTE_STATUS_LIST,
  PALETTE_SWATCH_FIELDS,
  PALETTE_VISIBILITY_LIST,
  PALETTE_VISIBILITY_STATES,
  canActorAccessPalette,
  canEditPaletteStatus,
  createPortablePaletteExport,
  isPaletteExportFormat,
  isPaletteStatus,
  isPaletteSwatch,
  isPaletteVersion,
  isPaletteVisibility,
  isPaletteVisibleToActor,
  validatePaletteContract,
  validatePortablePaletteExport,
} from "../../src/shared/contracts/paletteContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/palettes/palette-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(PALETTE_CONTRACT_ID, "gamefoundrystudio.palette.lifecycle");
  assert.equal(PALETTE_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(PALETTE_FIELDS, {
    PALETTE_ID: "paletteId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    SOURCE_TOOL_STATE: "sourceToolState",
    VISIBILITY: "visibility",
    VERSION: "version",
    STATUS: "status",
    SWATCHES: "swatches",
    EXPORT_FORMATS: "exportFormats",
  });
  assert.deepEqual(PALETTE_SWATCH_FIELDS, {
    SYMBOL: "symbol",
    HEX: "hex",
    NAME: "name",
    SOURCE: "source",
    TAGS: "tags",
  });
  assert.deepEqual(PALETTE_STATUS_LIST, ["draft", "active", "archived"]);
  assert.deepEqual(PALETTE_VISIBILITY_LIST, [
    "private",
    "project",
    "unlisted",
    "public",
    "marketplace",
  ]);
  assert.deepEqual(PALETTE_EXPORT_FORMAT_LIST, [
    "palette-json",
    "project-package",
  ]);
  assert.deepEqual(PALETTE_PORTABLE_EXPORT_FIELDS, [
    "paletteId",
    "sourceToolState",
    "visibility",
    "version",
    "status",
    "swatches",
    "exportFormats",
  ]);
  assertUnique(PALETTE_STATUS_LIST);
  assertUnique(PALETTE_VISIBILITY_LIST);
  assertUnique(PALETTE_EXPORT_FORMAT_LIST);

  assert.equal(isPaletteStatus(PALETTE_STATUS.ACTIVE), true);
  assert.equal(isPaletteStatus("deleted"), false);
  assert.equal(isPaletteVisibility(PALETTE_VISIBILITY_STATES.PROJECT), true);
  assert.equal(isPaletteVisibility("team"), false);
  assert.equal(isPaletteVersion(1), true);
  assert.equal(isPaletteVersion(0), false);
  assert.equal(isPaletteExportFormat(PALETTE_EXPORT_FORMATS.PALETTE_JSON), true);
  assert.equal(isPaletteExportFormat("css"), false);
  assert.equal(isPaletteSwatch({
    hex: "#3366FF",
    name: "HUD Blue",
    symbol: "H",
    source: "Palette Manager V2",
    tags: ["ui", "hud"],
  }), true);
  assert.equal(isPaletteSwatch({
    hex: "3366FF",
    name: "HUD Blue",
  }), false);

  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);
  assert.equal(isProjectVisibility(PROJECT_VISIBILITY_STATES.PROJECT), true);
  assert.equal(PROJECT_ROLES.COLLABORATOR, "collaborator");
  assert.equal(TOOL_STATE_FIELDS.TOOL_STATE_ID, "toolStateId");
  assert.equal(isToolStateVersion(1), true);

  for (const scenario of scenarios.validPalettes) {
    const validation = validatePaletteContract(scenario.palette);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidPalettes) {
    const validation = validatePaletteContract(scenario.palette);
    assert.equal(validation.valid, false, scenario.name);
    assertErrorCodes(validation, scenario.expectedErrors, scenario.name);
  }

  const linkedPalette = scenarios.validPalettes[0].palette;
  assert.equal(linkedPalette.sourceToolState.toolStateId, "tool-state.palette.hud");
  assert.equal(linkedPalette.sourceToolState.toolType, "palette-manager-v2");
  assert.equal(linkedPalette.sourceToolState.projectId, linkedPalette.projectId);
  assert.equal(isToolStateVersion(linkedPalette.sourceToolState.version), true);

  const emptyPalette = scenarios.validPalettes[1].palette;
  assert.equal(validatePaletteContract(emptyPalette).valid, true);
  assert.deepEqual(emptyPalette.swatches, []);

  const privatePalette = scenarios.accessChecks[1].palette;
  const privateProject = scenarios.accessChecks[1].project;
  assert.equal(isPaletteVisibleToActor({
    actorId: "user.other",
    palette: privatePalette,
    project: privateProject,
  }), false);
  assert.equal(isPaletteVisibleToActor({
    actorId: "user.viewer",
    palette: privatePalette,
    project: privateProject,
    grantedProjectIds: ["project.private"],
  }), true);

  for (const scenario of scenarios.accessChecks) {
    assert.equal(canActorAccessPalette({
      actorId: scenario.actorId,
      projectRole: scenario.projectRole,
      permission: scenario.permission,
      palette: scenario.palette,
      project: scenario.project,
      grantedProjectIds: scenario.grantedProjectIds,
      grantedScopes: scenario.grantedScopes,
      policy: scenario.policy,
    }), scenario.expected, scenario.name);
  }

  const archivedPalette = scenarios.validPalettes[2].palette;
  assert.equal(canEditPaletteStatus(archivedPalette), false);
  assert.equal(canEditPaletteStatus(archivedPalette, {
    allowArchivedPaletteEdit: true,
  }), true);
  assert.equal(canActorAccessPalette({
    actorId: archivedPalette.ownerId,
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    palette: archivedPalette,
    project: {
      id: archivedPalette.projectId,
      ownerId: archivedPalette.ownerId,
      state: "active",
      visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    },
  }), false);
  assert.equal(canActorAccessPalette({
    actorId: archivedPalette.ownerId,
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    palette: archivedPalette,
    project: {
      id: archivedPalette.projectId,
      ownerId: archivedPalette.ownerId,
      state: "active",
      visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    },
    policy: {
      allowArchivedPaletteEdit: true,
    },
  }), true);

  const portableResult = createPortablePaletteExport(linkedPalette);
  assert.equal(portableResult.valid, true);
  assert.deepEqual(portableResult.errors, []);
  const portableExport = portableResult.export;
  assert.equal(portableExport.contractId, PALETTE_CONTRACT_ID);
  assert.equal(portableExport.contractVersion, PALETTE_CONTRACT_VERSION);
  assert.equal(portableExport.portable, true);
  assert.equal(portableExport.paletteId, linkedPalette.paletteId);
  assert.equal(portableExport.ownerId, undefined);
  assert.equal(portableExport.projectId, undefined);
  assert.equal(portableExport.databaseId, undefined);
  assert.equal(portableExport.sourceToolState.toolStateId, linkedPalette.sourceToolState.toolStateId);
  assert.equal(portableExport.sourceToolState.toolType, linkedPalette.sourceToolState.toolType);
  assert.equal(portableExport.sourceToolState.projectId, undefined);
  assert.equal(portableExport.sourceToolState.ownerId, undefined);
  assert.deepEqual(portableExport.swatches, linkedPalette.swatches);
  for (const fieldName of PALETTE_PORTABLE_EXPORT_FIELDS) {
    assert.equal(Object.hasOwn(portableExport, fieldName), true, fieldName);
  }

  const portableValidation = validatePortablePaletteExport(portableExport);
  assert.equal(portableValidation.valid, true);
  assert.deepEqual(portableValidation.errors, []);

  assertErrorCodes(validatePortablePaletteExport({
    ...portableExport,
    ownerId: "user.owner",
  }), [PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export strips owner");
  assertErrorCodes(validatePortablePaletteExport({
    ...portableExport,
    exportFormats: ["css"],
  }), [PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export format is approved");
  assertErrorCodes(validatePortablePaletteExport({
    ...portableExport,
    swatches: [
      {
        hex: "#12345",
        name: "Broken",
      },
    ],
  }), [PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export swatches stay valid");
  assertErrorCodes(validatePortablePaletteExport({
    ...portableExport,
    sourceToolState: {
      ...portableExport.sourceToolState,
      projectId: linkedPalette.projectId,
    },
  }), [PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable source tool state strips project");
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}
