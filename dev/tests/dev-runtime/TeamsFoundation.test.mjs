import test from "node:test";
import assert from "node:assert/strict";
import { SUPABASE_POSTGRES_PRODUCT_TABLES } from "../../../api/auth/provider-contract-stubs.mjs";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import { getMockDbTableSchemas } from "../../../api/persistence/mock-db-store.js";
import {
  addProjectMember,
  ensureProjectOwnerMember,
  readProjectTeamState,
  removeProjectMember,
} from "../../../api/teams/project-team-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 2200) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 2200) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
}

function addSyntheticUser(tables, sequence) {
  const userKey = makeSeedUlid(3000 + sequence);
  tables.users.push({
    authProvider: "supabase-auth",
    authProviderUserId: `team-user-${sequence}`,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    displayName: `Team User ${sequence}`,
    email: `team-user-${sequence}@example.invalid`,
    isActive: true,
    key: userKey,
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: SEED_DB_KEYS.users.admin,
  });
  return userKey;
}

function assignPlan(tables, userKey, planCode, start = 2300) {
  return assignUserMembership(tables, {
    externalSubscriptionId: `sub_team_${planCode.toLowerCase()}`,
    planCode,
    source: planCode.startsWith("FOUNDING_") ? "founding_paid" : "paid",
    userKey,
  }, options(start));
}

function addAcceptedBetaInvitation(tables, userKey) {
  const key = makeSeedUlid(2900);
  tables.invitations.push({
    acceptedAt: "2026-06-18T12:00:00.000Z",
    acceptedBy: userKey,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    email: "user2@example.invalid",
    expiresAt: "2026-07-18T12:00:00.000Z",
    invitationCode: "team-foundation-beta",
    invitedBy: SEED_DB_KEYS.users.admin,
    key,
    planKey: "BETA",
    status: "accepted",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: userKey,
  });
  return key;
}

function assignBeta(tables, userKey, start = 2400) {
  return assignUserMembership(tables, {
    invitationKey: addAcceptedBetaInvitation(tables, userKey),
    planCode: "BETA",
    source: "beta_invitation",
    userKey,
  }, options(start));
}

function createOwner(tables, projectKey, ownerUserKey, start = 2500) {
  return ensureProjectOwnerMember(tables, {
    ownerUserKey,
    projectKey,
  }, options(start));
}

function addActiveMember(tables, projectKey, userKey, start) {
  return addProjectMember(tables, {
    invitedBy: SEED_DB_KEYS.users.user1,
    projectKey,
    role: "editor",
    status: "active",
    userKey,
  }, options(start));
}

test("project_members is registered as a DB-backed product table", () => {
  const schemas = getMockDbTableSchemas();
  assert.deepEqual(schemas.project_members, [
    "key",
    "projectKey",
    "userKey",
    "role",
    "status",
    "invitedBy",
    "invitedAt",
    "joinedAt",
    "removedAt",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ]);
  assert.equal(SUPABASE_POSTGRES_PRODUCT_TABLES.includes("project_members"), true);
  assert.deepEqual(createServerSeedTables().project_members, []);
});

test("project owner creation writes an active owner member and exposes Free team state", () => {
  const tables = createServerSeedTables();
  const created = createOwner(tables, "project-free-owner", SEED_DB_KEYS.users.user1);
  assert.equal(created.member.role, "owner");
  assert.equal(created.member.status, "active");
  assert.equal(created.member.userKey, SEED_DB_KEYS.users.user1);
  assert.equal(created.team.activeCount, 1);
  assert.equal(created.team.maxTeamMembers, 1);
  assert.equal(created.team.collaborationEnabled, false);
  assert.equal(created.team.canInvite, false);
  assert.equal(created.team.remainingSeats, 0);

  const repeated = createOwner(tables, "project-free-owner", SEED_DB_KEYS.users.user1, 2510);
  assert.equal(repeated.member.key, created.member.key);
  assert.equal(tables.project_members.length, 1);
});

test("Free membership blocks invited collaborators beyond the owner", () => {
  const tables = createServerSeedTables();
  createOwner(tables, "project-free-limit", SEED_DB_KEYS.users.user1);
  assert.throws(() => addProjectMember(tables, {
    invitedBy: SEED_DB_KEYS.users.user1,
    projectKey: "project-free-limit",
    role: "viewer",
    status: "invited",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(2520)), /Collaboration is unavailable/);
});

test("Creator membership allows up to three active project members and removed members no longer count", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "CREATOR");
  createOwner(tables, "project-creator-limit", SEED_DB_KEYS.users.user1);
  addActiveMember(tables, "project-creator-limit", SEED_DB_KEYS.users.user2, 2530);
  const third = addActiveMember(tables, "project-creator-limit", SEED_DB_KEYS.users.user3, 2540);
  assert.equal(third.team.activeCount, 3);
  assert.equal(third.team.maxTeamMembers, 3);
  assert.equal(third.team.canInvite, false);
  assert.throws(() => addActiveMember(tables, "project-creator-limit", SEED_DB_KEYS.users.admin, 2550), /team limit is reached/);

  const removed = removeProjectMember(tables, {
    projectKey: "project-creator-limit",
    userKey: SEED_DB_KEYS.users.user3,
  }, options(2560));
  assert.equal(removed.team.activeCount, 2);
  assert.equal(removed.team.canInvite, true);
  const replacement = addActiveMember(tables, "project-creator-limit", SEED_DB_KEYS.users.admin, 2570);
  assert.equal(replacement.team.activeCount, 3);
  assert.equal(replacement.team.remainingSeats, 0);
});

test("Studio membership allows up to ten active project members", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "STUDIO");
  createOwner(tables, "project-studio-limit", SEED_DB_KEYS.users.user1);
  for (let index = 1; index <= 9; index += 1) {
    addActiveMember(tables, "project-studio-limit", addSyntheticUser(tables, index), 2600 + index);
  }
  const state = readProjectTeamState(tables, { projectKey: "project-studio-limit" });
  assert.equal(state.activeCount, 10);
  assert.equal(state.maxTeamMembers, 10);
  assert.equal(state.canInvite, false);
  assert.throws(() => addActiveMember(tables, "project-studio-limit", addSyntheticUser(tables, 10), 2620), /team limit is reached/);
});

test("Beta membership uses Studio-equivalent ten member team limit", () => {
  const tables = createServerSeedTables();
  assignBeta(tables, SEED_DB_KEYS.users.user2);
  ensureProjectOwnerMember(tables, {
    ownerUserKey: SEED_DB_KEYS.users.user2,
    projectKey: "project-beta-limit",
  }, options(2700));
  for (let index = 11; index <= 19; index += 1) {
    addProjectMember(tables, {
      invitedBy: SEED_DB_KEYS.users.user2,
      projectKey: "project-beta-limit",
      role: "editor",
      status: "active",
      userKey: addSyntheticUser(tables, index),
    }, options(2700 + index));
  }
  const state = readProjectTeamState(tables, { projectKey: "project-beta-limit" });
  assert.equal(state.ownerMembership.plan.code, "BETA");
  assert.equal(state.activeCount, 10);
  assert.equal(state.maxTeamMembers, 10);
  assert.equal(state.canInvite, false);
});

test("missing active owner membership blocks collaboration actions without mutation", () => {
  const tables = createServerSeedTables();
  createOwner(tables, "project-missing-membership", SEED_DB_KEYS.users.user1);
  tables.user_memberships = tables.user_memberships.filter((row) => row.userKey !== SEED_DB_KEYS.users.user1);
  const beforeCount = tables.project_members.length;
  assert.throws(() => addProjectMember(tables, {
    invitedBy: SEED_DB_KEYS.users.user1,
    projectKey: "project-missing-membership",
    role: "editor",
    status: "active",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(2800)), /Active membership/);
  assert.equal(tables.project_members.length, beforeCount);
});
