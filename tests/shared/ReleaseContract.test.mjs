/*
Toolbox Aid
David Quesenberry
06/02/2026
ReleaseContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  isIdentityPermission,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  GAME_MANIFEST_EXPORT_FORMATS,
  GAME_MANIFEST_STATUS,
  validateGameManifestContract,
} from "../../src/shared/contracts/gameManifestContract.js";
import {
  PROJECT_ROLES,
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../src/shared/contracts/projectContract.js";
import {
  RELEASE_CONTRACT_ERRORS,
  RELEASE_CONTRACT_ID,
  RELEASE_CONTRACT_VERSION,
  RELEASE_FIELD_LIST,
  RELEASE_FIELDS,
  RELEASE_PORTABLE_EXPORT_FIELDS,
  RELEASE_RULES,
  RELEASE_STATUS,
  RELEASE_STATUS_LIST,
  canActorAccessRelease,
  canPatchReleaseStatus,
  createPortableReleaseExport,
  isReleaseHistoricallyReferenceable,
  isReleaseSourceManifest,
  isReleaseStatus,
  isReleaseVersion,
  isReleaseVisibility,
  isReleaseVisibleToActor,
  validatePortableReleaseExport,
  validateReleaseContract,
} from "../../src/shared/contracts/releaseContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/releases/release-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(RELEASE_CONTRACT_ID, "gamefoundrystudio.release.contract");
  assert.equal(RELEASE_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(RELEASE_FIELD_LIST, [
    "releaseId",
    "ownerId",
    "projectId",
    "sourceManifest",
    "version",
    "status",
    "visibility",
    "publishedAt",
    "releaseNotes",
  ]);
  assert.deepEqual(RELEASE_FIELDS, {
    RELEASE_ID: "releaseId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    SOURCE_MANIFEST: "sourceManifest",
    VERSION: "version",
    STATUS: "status",
    VISIBILITY: "visibility",
    PUBLISHED_AT: "publishedAt",
    RELEASE_NOTES: "releaseNotes",
  });
  assert.deepEqual(RELEASE_STATUS_LIST, ["draft", "published", "retired"]);
  assert.deepEqual(RELEASE_PORTABLE_EXPORT_FIELDS, [
    "releaseId",
    "sourceManifest",
    "version",
    "status",
    "visibility",
    "publishedAt",
    "releaseNotes",
  ]);
  assert.equal(RELEASE_RULES.REQUIRES_OWNER, true);
  assert.equal(RELEASE_RULES.REQUIRES_PROJECT, true);
  assert.equal(RELEASE_RULES.REQUIRES_SOURCE_MANIFEST, true);
  assert.equal(RELEASE_RULES.CANNOT_BYPASS_OWNERSHIP_VISIBILITY_PERMISSIONS, true);
  assert.equal(RELEASE_RULES.PUBLISHED_IMMUTABLE_UNLESS_POLICY_ALLOWS_PATCHING, true);
  assert.equal(RELEASE_RULES.RETIRED_RELEASES_REMAIN_HISTORICALLY_REFERENCEABLE, true);
  assert.equal(RELEASE_RULES.REQUIRES_VALID_VERSION, true);
  assert.equal(RELEASE_RULES.REQUIRES_VALID_VISIBILITY, true);
  assertUnique(RELEASE_STATUS_LIST);

  assert.equal(isReleaseStatus(RELEASE_STATUS.PUBLISHED), true);
  assert.equal(isReleaseStatus("archived"), false);
  assert.equal(isReleaseVisibility(PROJECT_VISIBILITY_STATES.PUBLIC), true);
  assert.equal(isReleaseVisibility("marketplace"), false);
  assert.equal(isReleaseVersion(1), true);
  assert.equal(isReleaseVersion(0), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);

  for (const scenario of scenarios.validReleases) {
    const validation = validateReleaseContract(scenario.release);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidReleases) {
    const validation = validateReleaseContract(scenario.release);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", RELEASE_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", RELEASE_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing source manifest", RELEASE_CONTRACT_ERRORS.SOURCE_MANIFEST_REQUIRED);
  assertErrorForScenario(scenarios, "invalid source manifest", RELEASE_CONTRACT_ERRORS.SOURCE_MANIFEST_INVALID);
  assertErrorForScenario(scenarios, "invalid version", RELEASE_CONTRACT_ERRORS.VERSION_INVALID);
  assertErrorForScenario(scenarios, "invalid visibility", RELEASE_CONTRACT_ERRORS.VISIBILITY_INVALID);

  const project = {
    id: "project.game.alpha",
    ownerId: "user.owner",
    projectType: PROJECT_TYPES.GAME,
    state: "published",
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  const sourceManifestRecord = {
    manifestId: "manifest.game.alpha",
    ownerId: "user.owner",
    projectId: "project.game.alpha",
    projectType: PROJECT_TYPES.GAME,
    sourceToolStates: [],
    sourceAssets: [],
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    version: 1,
    status: GAME_MANIFEST_STATUS.PUBLISHED,
    exportFormat: GAME_MANIFEST_EXPORT_FORMATS.GAME_MANIFEST_JSON,
  };
  const sourceManifestReference = {
    manifestId: sourceManifestRecord.manifestId,
    version: sourceManifestRecord.version,
    exportFormat: sourceManifestRecord.exportFormat,
  };
  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateGameManifestContract(sourceManifestRecord).valid, true);
  assert.equal(isReleaseSourceManifest(sourceManifestReference), true);
  assert.equal(isReleaseSourceManifest({
    version: 1,
    exportFormat: GAME_MANIFEST_EXPORT_FORMATS.GAME_MANIFEST_JSON,
  }), false);

  const release = scenarios.validReleases[0].release;
  const portableResult = createPortableReleaseExport(release);
  assert.equal(portableResult.valid, true);
  assert.deepEqual(portableResult.errors, []);
  const portableExport = portableResult.export;
  assert.equal(portableExport.contractId, RELEASE_CONTRACT_ID);
  assert.equal(portableExport.contractVersion, RELEASE_CONTRACT_VERSION);
  assert.equal(portableExport.portable, true);
  assert.equal(portableExport.ownerId, undefined);
  assert.equal(portableExport.projectId, undefined);
  assert.equal(portableExport.databaseId, undefined);
  assert.deepEqual(portableExport.sourceManifest, release.sourceManifest);
  for (const fieldName of RELEASE_PORTABLE_EXPORT_FIELDS) {
    assert.equal(Object.hasOwn(portableExport, fieldName), true, fieldName);
  }
  assert.equal(validatePortableReleaseExport(portableExport).valid, true);
  assertErrorCodes(validatePortableReleaseExport({
    ...portableExport,
    projectId: "project.game.alpha",
  }), [RELEASE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable release strips project");

  assert.equal(isReleaseVisibleToActor({
    actorId: "user.other",
    release: {
      ...release,
      visibility: PROJECT_VISIBILITY_STATES.PRIVATE,
    },
    project,
  }), false);
  assert.equal(isReleaseVisibleToActor({
    actorId: "public.viewer",
    release,
    project,
  }), true);
  assert.equal(isReleaseVisibleToActor({
    actorId: "user.viewer",
    release: {
      ...release,
      visibility: PROJECT_VISIBILITY_STATES.PROJECT,
    },
    project: {
      ...project,
      visibility: PROJECT_VISIBILITY_STATES.PROJECT,
    },
    grantedProjectIds: ["project.game.alpha"],
  }), true);

  assert.equal(canActorAccessRelease({
    actorId: "user.viewer",
    projectRole: PROJECT_ROLES.VIEWER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    release,
    project,
  }), false, "release visibility does not grant edit permission");
  assert.equal(canActorAccessRelease({
    actorId: "user.collaborator",
    projectRole: PROJECT_ROLES.COLLABORATOR,
    permission: IDENTITY_PERMISSIONS.EDIT,
    release,
    project,
    grantedProjectIds: ["project.game.alpha"],
    grantedScopes: ["project"],
  }), false, "published release immutable by default");
  assert.equal(canActorAccessRelease({
    actorId: "user.collaborator",
    projectRole: PROJECT_ROLES.COLLABORATOR,
    permission: IDENTITY_PERMISSIONS.EDIT,
    release,
    project,
    grantedProjectIds: ["project.game.alpha"],
    grantedScopes: ["project"],
    policy: {
      allowPublishedReleasePatch: true,
    },
  }), true, "published release patch allowed by policy");
  assert.equal(canActorAccessRelease({
    actorId: "user.owner",
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.DELETE,
    release,
    project,
  }), true, "owner keeps object control");

  assert.equal(canPatchReleaseStatus(release), false);
  assert.equal(canPatchReleaseStatus(release, { allowPublishedReleasePatch: true }), true);

  const retiredRelease = {
    ...release,
    releaseId: "release.game.alpha.1.retired",
    status: RELEASE_STATUS.RETIRED,
  };
  assert.equal(validateReleaseContract(retiredRelease).valid, true);
  assert.equal(isReleaseHistoricallyReferenceable(retiredRelease), true);
  assert.equal(isReleaseVisibleToActor({
    actorId: "public.viewer",
    release: retiredRelease,
    project,
  }), true);

  const draftRelease = {
    releaseId: "release.game.alpha.draft",
    ownerId: "user.owner",
    projectId: "project.game.alpha",
    sourceManifest: sourceManifestReference,
    version: 2,
    status: RELEASE_STATUS.DRAFT,
    visibility: PROJECT_VISIBILITY_STATES.PROJECT,
    releaseNotes: "",
  };
  assert.equal(validateReleaseContract(draftRelease).valid, true);
  assert.equal(canPatchReleaseStatus(draftRelease), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidReleases.find((item) => item.name === name);
  const validation = validateReleaseContract(scenario.release);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
