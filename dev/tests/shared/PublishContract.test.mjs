/*
Toolbox Aid
David Quesenberry
06/02/2026
PublishContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  isIdentityPermission,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../../src/shared/contracts/projectContract.js";
import {
  PUBLISH_CONTRACT_ERRORS,
  PUBLISH_CONTRACT_ID,
  PUBLISH_CONTRACT_VERSION,
  PUBLISH_FIELD_LIST,
  PUBLISH_FIELDS,
  PUBLISH_FORBIDDEN_FIELDS,
  PUBLISH_RULES,
  PUBLISH_STATUS,
  PUBLISH_STATUS_LIST,
  canActorAccessPublish,
  canEditPublishStatus,
  isPublishHistoricallyReferenceable,
  isPublishSourceRelease,
  isPublishStatus,
  isPublishVisibility,
  isPublishVisibleToActor,
  validatePublishContract,
} from "../../../src/shared/contracts/publishContract.js";
import {
  RELEASE_STATUS,
  validateReleaseContract,
} from "../../../src/shared/contracts/releaseContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/publish/publish-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(PUBLISH_CONTRACT_ID, "gamefoundrystudio.publish.contract");
  assert.equal(PUBLISH_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(PUBLISH_FIELD_LIST, [
    "publishId",
    "ownerId",
    "projectId",
    "sourceRelease",
    "visibility",
    "status",
    "publishedAt",
    "publishNotes",
  ]);
  assert.deepEqual(PUBLISH_FIELDS, {
    PUBLISH_ID: "publishId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    SOURCE_RELEASE: "sourceRelease",
    VISIBILITY: "visibility",
    STATUS: "status",
    PUBLISHED_AT: "publishedAt",
    PUBLISH_NOTES: "publishNotes",
  });
  assert.deepEqual(PUBLISH_STATUS_LIST, ["draft", "ready", "published", "retired", "cancelled"]);
  assert.equal(PUBLISH_RULES.REQUIRES_OWNER, true);
  assert.equal(PUBLISH_RULES.REQUIRES_PROJECT, true);
  assert.equal(PUBLISH_RULES.REQUIRES_SOURCE_RELEASE, true);
  assert.equal(PUBLISH_RULES.CANNOT_BYPASS_OWNERSHIP_VISIBILITY_PERMISSIONS, true);
  assert.equal(PUBLISH_RULES.REQUIRES_VALID_VISIBILITY, true);
  assert.equal(PUBLISH_RULES.REQUIRES_VALID_LIFECYCLE_STATUS, true);
  assert.equal(PUBLISH_RULES.PUBLISHED_IMMUTABLE_UNLESS_POLICY_ALLOWS_EDIT, true);
  assert.equal(PUBLISH_RULES.RETIRED_PUBLISH_REMAINS_HISTORICALLY_REFERENCEABLE, true);
  assert.equal(PUBLISH_RULES.NO_RUNTIME_STATE, true);
  assert.equal(PUBLISH_RULES.NO_AUTH_STATE, true);
  assert.equal(PUBLISH_RULES.NO_MARKETPLACE_MODERATION_STATE, true);
  assert.equal(PUBLISH_RULES.NO_TOOL_STATE_LEAKAGE, true);
  assert.equal(PUBLISH_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(PUBLISH_FORBIDDEN_FIELDS.includes("authState"), true);
  assert.equal(PUBLISH_FORBIDDEN_FIELDS.includes("marketplaceModerationState"), true);
  assert.equal(PUBLISH_FORBIDDEN_FIELDS.includes("toolStateId"), true);
  assertUnique(PUBLISH_STATUS_LIST);
  assertUnique(PUBLISH_FORBIDDEN_FIELDS);

  assert.equal(isPublishStatus(PUBLISH_STATUS.READY), true);
  assert.equal(isPublishStatus("approved"), false);
  assert.equal(isPublishVisibility(PROJECT_VISIBILITY_STATES.PUBLIC), true);
  assert.equal(isPublishVisibility("marketplace"), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);

  for (const scenario of scenarios.validPublishes) {
    const validation = validatePublishContract(scenario.publish);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidPublishes) {
    const validation = validatePublishContract(scenario.publish);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", PUBLISH_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", PUBLISH_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing source release", PUBLISH_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "invalid source release", PUBLISH_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID);
  assertErrorForScenario(scenarios, "invalid visibility", PUBLISH_CONTRACT_ERRORS.VISIBILITY_INVALID);
  assertErrorForScenario(scenarios, "invalid status", PUBLISH_CONTRACT_ERRORS.STATUS_INVALID);
  assertErrorForScenario(scenarios, "published without timestamp", PUBLISH_CONTRACT_ERRORS.PUBLISHED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "runtime state leakage", PUBLISH_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth state leakage", PUBLISH_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "marketplace moderation state leakage", PUBLISH_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", PUBLISH_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const project = {
    id: "project.game.alpha",
    ownerId: "user.owner",
    projectType: PROJECT_TYPES.GAME,
    state: "published",
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  const sourceReleaseRecord = {
    releaseId: "release.game.alpha.1",
    ownerId: "user.owner",
    projectId: "project.game.alpha",
    sourceManifest: {
      manifestId: "manifest.game.alpha",
      version: 1,
      exportFormat: "game-manifest-json",
    },
    version: 1,
    status: RELEASE_STATUS.PUBLISHED,
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    publishedAt: "2026-06-02T14:00:00.000Z",
    releaseNotes: "Release linked by publish contract.",
  };
  const sourceReleaseReference = {
    releaseId: sourceReleaseRecord.releaseId,
    version: sourceReleaseRecord.version,
    status: sourceReleaseRecord.status,
  };
  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(sourceReleaseRecord).valid, true);
  assert.equal(isPublishSourceRelease(sourceReleaseReference), true);
  assert.equal(isPublishSourceRelease({
    releaseId: sourceReleaseRecord.releaseId,
    version: 1,
    status: "draft",
  }), false);

  const publish = scenarios.validPublishes[0].publish;
  assert.equal(isPublishVisibleToActor({
    actorId: "user.other",
    publish: {
      ...publish,
      visibility: PROJECT_VISIBILITY_STATES.PRIVATE,
    },
    project,
  }), false);
  assert.equal(isPublishVisibleToActor({
    actorId: "public.viewer",
    publish,
    project,
  }), true);
  assert.equal(isPublishVisibleToActor({
    actorId: "user.viewer",
    publish: {
      ...publish,
      visibility: PROJECT_VISIBILITY_STATES.PROJECT,
    },
    project: {
      ...project,
      visibility: PROJECT_VISIBILITY_STATES.PROJECT,
    },
    grantedProjectIds: ["project.game.alpha"],
  }), true);

  assert.equal(canActorAccessPublish({
    actorId: "user.viewer",
    projectRole: PROJECT_ROLES.VIEWER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    publish,
    project,
  }), false, "publish visibility does not grant edit permission");
  assert.equal(canActorAccessPublish({
    actorId: "user.collaborator",
    projectRole: PROJECT_ROLES.COLLABORATOR,
    permission: IDENTITY_PERMISSIONS.EDIT,
    publish,
    project,
    grantedProjectIds: ["project.game.alpha"],
    grantedScopes: ["project"],
  }), false, "published publish record immutable by default");
  assert.equal(canActorAccessPublish({
    actorId: "user.collaborator",
    projectRole: PROJECT_ROLES.COLLABORATOR,
    permission: IDENTITY_PERMISSIONS.EDIT,
    publish,
    project,
    grantedProjectIds: ["project.game.alpha"],
    grantedScopes: ["project"],
    policy: {
      allowPublishedPublishEdit: true,
    },
  }), true, "published publish record editable when policy allows");
  assert.equal(canActorAccessPublish({
    actorId: "user.owner",
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.DELETE,
    publish,
    project,
  }), true, "owner keeps object control");

  assert.equal(canEditPublishStatus(publish), false);
  assert.equal(canEditPublishStatus(publish, { allowPublishedPublishEdit: true }), true);

  const readyPublish = scenarios.validPublishes.find((scenario) => scenario.name === "ready project publish record").publish;
  assert.equal(canEditPublishStatus(readyPublish), true);

  const retiredPublish = {
    ...publish,
    publishId: "publish.game.alpha.1.retired",
    status: PUBLISH_STATUS.RETIRED,
    sourceRelease: {
      ...publish.sourceRelease,
      status: RELEASE_STATUS.RETIRED,
    },
  };
  assert.equal(validatePublishContract(retiredPublish).valid, true);
  assert.equal(isPublishHistoricallyReferenceable(retiredPublish), true);
  assert.equal(canEditPublishStatus(retiredPublish), false);
  assert.equal(canEditPublishStatus(retiredPublish, { allowRetiredPublishEdit: true }), true);

  const cancelledPublish = {
    ...readyPublish,
    status: PUBLISH_STATUS.CANCELLED,
  };
  assert.equal(validatePublishContract(cancelledPublish).valid, true);
  assert.equal(canEditPublishStatus(cancelledPublish), false);
  assert.equal(canEditPublishStatus(cancelledPublish, { allowCancelledPublishEdit: true }), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidPublishes.find((item) => item.name === name);
  const validation = validatePublishContract(scenario.publish);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
