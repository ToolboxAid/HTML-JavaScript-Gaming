/*
Toolbox Aid
David Quesenberry
06/02/2026
ToolStateContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  isIdentityPermission,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  PROJECT_RELATIONSHIPS,
  PROJECT_VISIBILITY_STATES,
  isProjectRelationship,
  isProjectVisibility,
} from "../../src/shared/contracts/projectContract.js";
import {
  TOOL_STATE_CONTRACT_ERRORS,
  TOOL_STATE_CONTRACT_ID,
  TOOL_STATE_CONTRACT_VERSION,
  TOOL_STATE_FIELDS,
  TOOL_STATE_PORTABLE_EXPORT_FIELDS,
  TOOL_STATE_RELATIONSHIP_LIST,
  TOOL_STATE_RELATIONSHIPS,
  TOOL_STATE_STATUS,
  TOOL_STATE_STATUS_LIST,
  TOOL_STATE_VISIBILITY_LIST,
  TOOL_STATE_VISIBILITY_STATES,
  canActorAccessToolState,
  canEditToolStateStatus,
  createPortableToolStateExport,
  isToolStateRelationship,
  isToolStateStatus,
  isToolStateVersion,
  isToolStateVisibility,
  isToolStateVisibleToActor,
  validatePortableToolStateExport,
  validateToolStateContract,
} from "../../src/shared/contracts/toolStateContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/tool-states/tool-state-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(TOOL_STATE_CONTRACT_ID, "gamefoundrystudio.tool-state.lifecycle");
  assert.equal(TOOL_STATE_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(TOOL_STATE_FIELDS, {
    TOOL_STATE_ID: "toolStateId",
    TOOL_TYPE: "toolType",
    OWNER: "ownerId",
    PROJECT: "projectId",
    VISIBILITY: "visibility",
    VERSION: "version",
    STATUS: "status",
  });
  assert.deepEqual(TOOL_STATE_STATUS_LIST, ["draft", "active", "archived"]);
  assert.deepEqual(TOOL_STATE_VISIBILITY_LIST, ["private", "project", "unlisted", "public"]);
  assert.deepEqual(TOOL_STATE_RELATIONSHIP_LIST, [
    "belongs-to-project",
    "owned-by-user",
    "may-reference-assets",
    "may-be-exported",
  ]);
  assert.deepEqual(TOOL_STATE_PORTABLE_EXPORT_FIELDS, [
    "toolStateId",
    "toolType",
    "visibility",
    "version",
    "status",
    "assetRefs",
    "payload",
  ]);
  assertUnique(TOOL_STATE_STATUS_LIST);
  assertUnique(TOOL_STATE_VISIBILITY_LIST);
  assertUnique(TOOL_STATE_RELATIONSHIP_LIST);

  assert.equal(isToolStateStatus(TOOL_STATE_STATUS.ACTIVE), true);
  assert.equal(isToolStateStatus("deleted"), false);
  assert.equal(isToolStateVisibility(TOOL_STATE_VISIBILITY_STATES.PROJECT), true);
  assert.equal(isToolStateVisibility("marketplace"), false);
  assert.equal(isToolStateRelationship(TOOL_STATE_RELATIONSHIPS.BELONGS_TO_PROJECT), true);
  assert.equal(isToolStateRelationship("writes-database"), false);
  assert.equal(isToolStateVersion(1), true);
  assert.equal(isToolStateVersion(0), false);
  assert.equal(isToolStateVersion("1"), false);

  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);
  assert.equal(isProjectVisibility(PROJECT_VISIBILITY_STATES.PROJECT), true);
  assert.equal(isProjectRelationship(PROJECT_RELATIONSHIPS.TOOL_STATES), true);

  for (const scenario of scenarios.validToolStates) {
    const validation = validateToolStateContract(scenario.toolState);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidToolStates) {
    const validation = validateToolStateContract(scenario.toolState);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", TOOL_STATE_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", TOOL_STATE_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing tool type", TOOL_STATE_CONTRACT_ERRORS.TOOL_TYPE_REQUIRED);
  assertErrorForScenario(scenarios, "invalid visibility", TOOL_STATE_CONTRACT_ERRORS.VISIBILITY_INVALID);
  assertErrorForScenario(scenarios, "invalid version", TOOL_STATE_CONTRACT_ERRORS.VERSION_INVALID);

  for (const scenario of scenarios.accessChecks) {
    assert.equal(canActorAccessToolState(scenario), scenario.expected, scenario.name);
  }

  assert.equal(
    isToolStateVisibleToActor({
      actorId: "user.other",
      toolState: {
        toolStateId: "tool-state.private",
        toolType: "palette-manager-v2",
        ownerId: "user.owner",
        projectId: "project.private",
        visibility: TOOL_STATE_VISIBILITY_STATES.PRIVATE,
        version: 1,
        status: TOOL_STATE_STATUS.ACTIVE,
      },
      project: {
        id: "project.private",
        ownerId: "user.owner",
        state: "active",
        visibility: PROJECT_VISIBILITY_STATES.PRIVATE,
      },
      grantedProjectIds: [],
    }),
    false
  );
  assert.equal(
    isToolStateVisibleToActor({
      actorId: "user.viewer",
      toolState: {
        toolStateId: "tool-state.project",
        toolType: "palette-manager-v2",
        ownerId: "user.owner",
        projectId: "project.active",
        visibility: TOOL_STATE_VISIBILITY_STATES.PROJECT,
        version: 1,
        status: TOOL_STATE_STATUS.ACTIVE,
      },
      project: {
        id: "project.active",
        ownerId: "user.owner",
        state: "active",
        visibility: PROJECT_VISIBILITY_STATES.PROJECT,
      },
      grantedProjectIds: ["project.active"],
    }),
    true
  );

  assert.equal(canEditToolStateStatus({ status: TOOL_STATE_STATUS.ARCHIVED }), false);
  assert.equal(canEditToolStateStatus({ status: TOOL_STATE_STATUS.ARCHIVED }, { allowArchivedToolStateEdit: true }), true);
  assert.equal(canEditToolStateStatus({ status: TOOL_STATE_STATUS.ACTIVE }), true);

  const exportResult = createPortableToolStateExport(scenarios.validToolStates[0].toolState);
  assert.equal(exportResult.valid, true);
  assert.equal(exportResult.errors.length, 0);
  assert.equal(exportResult.export.contractId, TOOL_STATE_CONTRACT_ID);
  assert.equal(exportResult.export.contractVersion, TOOL_STATE_CONTRACT_VERSION);
  assert.equal(exportResult.export.toolStateId, "tool-state.palette.alpha");
  assert.equal(exportResult.export.toolType, "palette-manager-v2");
  assert.equal(exportResult.export.version, 1);
  assert.equal(exportResult.export.status, TOOL_STATE_STATUS.ACTIVE);
  assert.deepEqual(exportResult.export.assetRefs, ["asset.palette.seed"]);
  assert.deepEqual(exportResult.export.payload.swatches, [{ hex: "#ffffff" }]);
  assert.equal(Object.hasOwn(exportResult.export, "ownerId"), false);
  assert.equal(Object.hasOwn(exportResult.export, "projectId"), false);
  assert.equal(Object.hasOwn(exportResult.export, "databaseId"), false);
  assert.equal(validatePortableToolStateExport(exportResult.export).valid, true);
  assert.equal(
    validatePortableToolStateExport({
      ...exportResult.export,
      ownerId: "user.owner",
    }).errors.some((error) => error.code === TOOL_STATE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID),
    true
  );
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidToolStates.find((item) => item.name === name);
  const validation = validateToolStateContract(scenario.toolState);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
