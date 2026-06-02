/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  isIdentityPermission,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  PROJECT_CONTRACT_ERRORS,
  PROJECT_CONTRACT_ID,
  PROJECT_CONTRACT_VERSION,
  PROJECT_INACTIVE_STATES,
  PROJECT_RELATIONSHIP_LIST,
  PROJECT_RELATIONSHIPS,
  PROJECT_ROLE_LIST,
  PROJECT_ROLE_PERMISSION_GRANTS,
  PROJECT_ROLES,
  PROJECT_STATE_LIST,
  PROJECT_STATES,
  PROJECT_VISIBILITY_LIST,
  PROJECT_VISIBILITY_STATES,
  canActorAccessProject,
  canEditProjectState,
  isMarketplaceProject,
  isProjectRelationship,
  isProjectRole,
  isProjectState,
  isProjectVisibility,
  isProjectVisibleToActor,
  validateProjectContract,
} from "../../src/shared/contracts/projectContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/projects/project-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(PROJECT_CONTRACT_ID, "gamefoundrystudio.project.lifecycle");
  assert.equal(PROJECT_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(PROJECT_STATE_LIST, [
    "draft",
    "active",
    "archived",
    "published",
    "marketplace",
    "retired",
  ]);
  assert.deepEqual(PROJECT_ROLE_LIST, [
    "owner",
    "collaborator",
    "viewer",
  ]);
  assert.deepEqual(PROJECT_VISIBILITY_LIST, [
    "private",
    "project",
    "unlisted",
    "public",
  ]);
  assert.deepEqual(PROJECT_RELATIONSHIP_LIST, [
    "tool-states",
    "assets",
    "palettes",
    "game-manifest",
    "releases",
    "marketplace-items",
  ]);
  assertUnique(PROJECT_STATE_LIST);
  assertUnique(PROJECT_ROLE_LIST);
  assertUnique(PROJECT_VISIBILITY_LIST);
  assertUnique(PROJECT_RELATIONSHIP_LIST);
  assert.equal(isProjectState(PROJECT_STATES.ACTIVE), true);
  assert.equal(isProjectRole(PROJECT_ROLES.COLLABORATOR), true);
  assert.equal(isProjectVisibility(PROJECT_VISIBILITY_STATES.PRIVATE), true);
  assert.equal(isProjectRelationship(PROJECT_RELATIONSHIPS.GAME_MANIFEST), true);
  assert.equal(isProjectState("deleted"), false);
  assert.equal(isProjectRole("editor"), false);
  assert.equal(isProjectVisibility("marketplace"), false);
  assert.equal(isProjectRelationship("database-table"), false);

  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);
  assert.equal(IDENTITY_PERMISSION_SCOPES.PROJECT, "project");
  assert.deepEqual(PROJECT_ROLE_PERMISSION_GRANTS[PROJECT_ROLES.OWNER], [
    "view",
    "create",
    "edit",
    "delete",
    "share",
    "publish",
  ]);
  assert.deepEqual(PROJECT_ROLE_PERMISSION_GRANTS[PROJECT_ROLES.COLLABORATOR], ["view", "edit"]);
  assert.deepEqual(PROJECT_ROLE_PERMISSION_GRANTS[PROJECT_ROLES.VIEWER], ["view"]);

  for (const scenario of scenarios.validProjects) {
    const validation = validateProjectContract(scenario.project);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidProjects) {
    const validation = validateProjectContract(scenario.project);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", PROJECT_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing visibility", PROJECT_CONTRACT_ERRORS.VISIBILITY_REQUIRED);
  assertErrorForScenario(scenarios, "invalid state", PROJECT_CONTRACT_ERRORS.STATE_INVALID);
  assertErrorForScenario(scenarios, "invalid member role", PROJECT_CONTRACT_ERRORS.ROLE_INVALID);

  for (const scenario of scenarios.accessChecks) {
    assert.equal(canActorAccessProject(scenario), scenario.expected, scenario.name);
  }

  assert.equal(
    isProjectVisibleToActor(
      "user.other",
      {
        id: "project.private",
        ownerId: "user.owner",
        visibility: PROJECT_VISIBILITY_STATES.PRIVATE,
      },
      []
    ),
    false
  );
  assert.equal(
    isProjectVisibleToActor(
      "user.viewer",
      {
        id: "project.private",
        ownerId: "user.owner",
        visibility: PROJECT_VISIBILITY_STATES.PRIVATE,
      },
      ["project.private"]
    ),
    true
  );

  const publishedPublicProject = {
    id: "project.public.published",
    ownerId: "user.owner",
    state: PROJECT_STATES.PUBLISHED,
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  const marketplaceProject = {
    id: "project.public.marketplace",
    ownerId: "user.owner",
    state: PROJECT_STATES.MARKETPLACE,
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  assert.equal(PROJECT_VISIBILITY_LIST.includes("marketplace"), false);
  assert.equal(isMarketplaceProject(publishedPublicProject), false);
  assert.equal(isMarketplaceProject(marketplaceProject), true);

  assert.deepEqual(PROJECT_INACTIVE_STATES, ["archived", "retired"]);
  assert.equal(canEditProjectState({ state: PROJECT_STATES.ARCHIVED }), false);
  assert.equal(canEditProjectState({ state: PROJECT_STATES.ARCHIVED }, { allowArchivedProjectEdit: true }), true);
  assert.equal(canEditProjectState({ state: PROJECT_STATES.RETIRED }), false);
  assert.equal(canEditProjectState({ state: PROJECT_STATES.RETIRED }, { allowRetiredProjectEdit: true }), true);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidProjects.find((item) => item.name === name);
  const validation = validateProjectContract(scenario.project);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
