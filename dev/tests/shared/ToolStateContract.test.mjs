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
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  PROJECT_RELATIONSHIPS,
  PROJECT_VISIBILITY_STATES,
  isProjectRelationship,
  isProjectVisibility,
} from "../../../src/shared/contracts/projectContract.js";
import {
  TOOL_STATE_CONTRACT_ERRORS,
  TOOL_STATE_CONTRACT_ID,
  TOOL_STATE_CONTRACT_VERSION,
  TOOL_STATE_FIELDS,
  TOOL_STATE_PORTABLE_EXPORT_FIELDS,
  TOOL_STATE_RECOVERY_ACTIONS,
  TOOL_STATE_RECOVERY_AGE,
  TOOL_STATE_RECOVERY_RULES,
  TOOL_STATE_RELATIONSHIP_LIST,
  TOOL_STATE_RELATIONSHIPS,
  TOOL_STATE_SLOTS,
  TOOL_STATE_STARTUP_ACTION_LIST,
  TOOL_STATE_STATUS,
  TOOL_STATE_STATUS_LIST,
  TOOL_STATE_VISIBILITY_LIST,
  TOOL_STATE_VISIBILITY_STATES,
  canActorAccessToolState,
  canEditToolStateStatus,
  createPortableToolStateExport,
  discardToolStateRecovery,
  getToolStateRecoveryAge,
  getToolStateStartupChoices,
  isToolStateRelationship,
  isToolStateStatus,
  isToolStateVersion,
  isToolStateVisibility,
  isToolStateVisibleToActor,
  promoteToolStateRecovery,
  resolveToolStateStartupState,
  selectToolStateStartupAction,
  validatePortableToolStateExport,
  validateToolStateRecoveryContract,
  validateToolStateContract,
} from "../../../src/shared/contracts/toolStateContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/tool-states/tool-state-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(TOOL_STATE_CONTRACT_ID, "gamefoundrystudio.tool-state.lifecycle");
  assert.equal(TOOL_STATE_CONTRACT_VERSION, "1.1.0");
  assert.deepEqual(TOOL_STATE_FIELDS, {
    TOOL_STATE_ID: "toolStateId",
    TOOL_TYPE: "toolType",
    OWNER: "ownerId",
    PROJECT: "projectId",
    VISIBILITY: "visibility",
    VERSION: "version",
    STATUS: "status",
  });
  assert.deepEqual(TOOL_STATE_SLOTS, {
    CURRENT_SAVED_STATE: "current-saved-state",
    RECOVERY_STATE: "recovery-state",
    VERSION_HISTORY: "version-history",
  });
  assert.deepEqual(TOOL_STATE_STATUS_LIST, ["draft", "active", "archived"]);
  assert.deepEqual(TOOL_STATE_VISIBILITY_LIST, ["private", "project", "unlisted", "public"]);
  assert.deepEqual(TOOL_STATE_RELATIONSHIP_LIST, [
    "belongs-to-project",
    "owned-by-user",
    "may-reference-assets",
    "may-be-exported",
  ]);
  assert.deepEqual(TOOL_STATE_STARTUP_ACTION_LIST, ["resume", "open"]);
  assert.deepEqual(TOOL_STATE_RECOVERY_AGE, {
    NEWER_THAN_SAVED: "newer-than-saved",
    OLDER_THAN_SAVED: "older-than-saved",
    SAME_AS_SAVED: "same-as-saved",
    WITHOUT_SAVED_STATE: "without-saved-state",
  });
  assert.equal(TOOL_STATE_RECOVERY_RULES.SEPARATE_FROM_SAVED_STATE, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.TEMPORARY, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.NEVER_OVERWRITES_SAVED_STATE_AUTOMATICALLY, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.USER_SELECTED, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.MAY_BE_AUTOSAVED, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.MAY_BE_DISCARDED, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.MAY_BE_PROMOTED_TO_SAVED_STATE, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.NEVER_AUTO_LOADED, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.NEVER_AUTO_APPLIED, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.REMAINS_AVAILABLE_UNTIL_SAVED_OR_DISCARDED, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.REQUIRES_TIMESTAMP, true);
  assert.equal(TOOL_STATE_RECOVERY_RULES.IDENTIFIES_TOOL_AND_PROJECT, true);
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

  for (const scenario of scenarios.recoveryScenarios.valid) {
    const validation = validateToolStateRecoveryContract(scenario.context);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
    assert.equal(getToolStateRecoveryAge(scenario.context), scenario.expectedAge, scenario.name);
  }

  for (const scenario of scenarios.recoveryScenarios.invalid) {
    const validation = validateToolStateRecoveryContract(scenario.context);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  const recoveryContext = scenarios.recoveryScenarios.valid.find((scenario) => scenario.name === "recovery exists").context;
  const startupState = resolveToolStateStartupState(recoveryContext);
  assert.equal(startupState.action, null);
  assert.equal(startupState.stateSlot, null);
  assert.equal(startupState.loadedState, null);
  assert.equal(startupState.recoveryAvailable, true);
  assert.deepEqual(startupState.choices.map((choice) => choice.label), ["Resume", "Open"]);

  const choices = getToolStateStartupChoices(recoveryContext);
  assert.deepEqual(choices.map((choice) => choice.action), [
    TOOL_STATE_RECOVERY_ACTIONS.RESUME,
    TOOL_STATE_RECOVERY_ACTIONS.OPEN,
  ]);
  assert.equal(choices[0].stateSlot, TOOL_STATE_SLOTS.RECOVERY_STATE);
  assert.equal(choices[1].stateSlot, TOOL_STATE_SLOTS.CURRENT_SAVED_STATE);
  assert.equal(choices[0].enabled, true);
  assert.equal(choices[1].enabled, true);

  const recoveryWithoutSavedState = scenarios.recoveryScenarios.valid.find((scenario) => scenario.name === "recovery without saved state").context;
  const unsavedChoices = getToolStateStartupChoices(recoveryWithoutSavedState);
  assert.deepEqual(unsavedChoices.map((choice) => choice.action), [
    TOOL_STATE_RECOVERY_ACTIONS.RESUME,
    TOOL_STATE_RECOVERY_ACTIONS.OPEN,
  ]);
  assert.equal(unsavedChoices[0].enabled, true);
  assert.equal(unsavedChoices[1].enabled, false);

  const resumed = selectToolStateStartupAction(recoveryContext, TOOL_STATE_RECOVERY_ACTIONS.RESUME);
  assert.equal(resumed.action, TOOL_STATE_RECOVERY_ACTIONS.RESUME);
  assert.equal(resumed.stateSlot, TOOL_STATE_SLOTS.RECOVERY_STATE);
  assert.deepEqual(resumed.loadedState.payload.swatches, ["recovery-green"]);
  assert.deepEqual(resumed.savedState.payload.swatches, ["saved-blue"]);

  const opened = selectToolStateStartupAction(recoveryContext, TOOL_STATE_RECOVERY_ACTIONS.OPEN);
  assert.equal(opened.action, TOOL_STATE_RECOVERY_ACTIONS.OPEN);
  assert.equal(opened.stateSlot, TOOL_STATE_SLOTS.CURRENT_SAVED_STATE);
  assert.deepEqual(opened.loadedState.payload.swatches, ["saved-blue"]);
  assert.deepEqual(opened.recoveryState.payload.swatches, ["recovery-green"]);
  assert.deepEqual(recoveryContext.savedState.payload.swatches, ["saved-blue"]);
  assert.deepEqual(recoveryContext.recoveryState.payload.swatches, ["recovery-green"]);

  const discarded = discardToolStateRecovery(recoveryContext);
  assert.deepEqual(discarded.savedState.payload.swatches, ["saved-blue"]);
  assert.equal(discarded.recoveryState, null);

  const promoted = promoteToolStateRecovery(recoveryContext);
  assert.deepEqual(promoted.savedState.payload.swatches, ["recovery-green"]);
  assert.equal(promoted.savedState.savedAt, "2026-06-02T13:30:00.000Z");
  assert.equal(Object.hasOwn(promoted.savedState, "autosaved"), false);
  assert.equal(Object.hasOwn(promoted.savedState, "temporary"), false);
  assert.equal(Object.hasOwn(promoted.savedState, "timestamp"), false);
  assert.equal(promoted.recoveryState, null);
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
