import test from "node:test";
import assert from "node:assert/strict";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import {
  addProjectMember,
  assertProjectMemberAccess,
  changeProjectMemberRole,
  ensureProjectOwnerMember,
  inviteProjectMember,
  joinProjectMember,
  readProjectTeamState,
  removeProjectMember,
} from "../../../api/teams/project-team-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 3200) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 3200) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
}

function addSyntheticUser(tables, sequence) {
  const userKey = makeSeedUlid(4000 + sequence);
  tables.users.push({
    authProvider: "supabase-auth",
    authProviderUserId: `team-enforcement-${sequence}`,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    displayName: `Team Enforcement ${sequence}`,
    email: `team-enforcement-${sequence}@example.invalid`,
    isActive: true,
    key: userKey,
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: SEED_DB_KEYS.users.admin,
  });
  return userKey;
}

function assignPlan(tables, userKey, planCode, start = 3300) {
  return assignUserMembership(tables, {
    externalSubscriptionId: `sub_enforcement_${planCode.toLowerCase()}`,
    planCode,
    source: "paid",
    userKey,
  }, options(start));
}

function addAcceptedBetaInvitation(tables, userKey) {
  const key = makeSeedUlid(3900);
  tables.invitations.push({
    acceptedAt: "2026-06-18T12:00:00.000Z",
    acceptedBy: userKey,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    email: "user2@example.invalid",
    expiresAt: "2026-07-18T12:00:00.000Z",
    invitationCode: "team-enforcement-beta",
    invitedBy: SEED_DB_KEYS.users.admin,
    key,
    planKey: "BETA",
    status: "accepted",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: userKey,
  });
  return key;
}

function assignBeta(tables, userKey, start = 3400) {
  return assignUserMembership(tables, {
    invitationKey: addAcceptedBetaInvitation(tables, userKey),
    planCode: "BETA",
    source: "beta_invitation",
    userKey,
  }, options(start));
}

function createOwner(tables, projectKey, ownerUserKey, start = 3500) {
  return ensureProjectOwnerMember(tables, {
    ownerUserKey,
    projectKey,
  }, options(start));
}

function addActiveMember(tables, projectKey, userKey, invitedBy, start) {
  return addProjectMember(tables, {
    invitedBy,
    projectKey,
    role: "editor",
    status: "active",
    userKey,
  }, options(start));
}

function inviteMember(tables, projectKey, userKey, invitedBy, start) {
  return inviteProjectMember(tables, {
    invitedBy,
    projectKey,
    role: "viewer",
    userKey,
  }, options(start));
}

test("Free invite is blocked with plan limit and current count diagnostics", () => {
  const tables = createServerSeedTables();
  createOwner(tables, "project-free-enforcement", SEED_DB_KEYS.users.user1);
  assert.throws(() => inviteMember(tables, "project-free-enforcement", SEED_DB_KEYS.users.user2, SEED_DB_KEYS.users.user1, 3510), (error) => {
    assert.match(error.message, /FREE membership limit is 1/);
    assert.match(error.message, /current team count is 1/);
    assert.match(error.message, /Collaboration is unavailable/);
    return true;
  });
});

test("Creator fourth active or reserved member is blocked", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "CREATOR");
  createOwner(tables, "project-creator-enforcement", SEED_DB_KEYS.users.user1);
  addActiveMember(tables, "project-creator-enforcement", SEED_DB_KEYS.users.user2, SEED_DB_KEYS.users.user1, 3520);
  const invited = inviteMember(tables, "project-creator-enforcement", SEED_DB_KEYS.users.user3, SEED_DB_KEYS.users.user1, 3530);
  assert.equal(invited.team.activeCount, 2);
  assert.equal(invited.team.invitedCount, 1);
  assert.equal(invited.team.reservedSeatCount, 3);
  assert.throws(() => inviteMember(tables, "project-creator-enforcement", SEED_DB_KEYS.users.admin, SEED_DB_KEYS.users.user1, 3540), /CREATOR membership limit is 3.*current team count is 3.*team limit is reached/);
});

test("Studio eleventh active or reserved member is blocked", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "STUDIO");
  createOwner(tables, "project-studio-enforcement", SEED_DB_KEYS.users.user1);
  for (let index = 1; index <= 8; index += 1) {
    addActiveMember(tables, "project-studio-enforcement", addSyntheticUser(tables, index), SEED_DB_KEYS.users.user1, 3600 + index);
  }
  inviteMember(tables, "project-studio-enforcement", addSyntheticUser(tables, 9), SEED_DB_KEYS.users.user1, 3610);
  const state = readProjectTeamState(tables, { projectKey: "project-studio-enforcement" });
  assert.equal(state.maxTeamMembers, 10);
  assert.equal(state.reservedSeatCount, 10);
  assert.throws(() => inviteMember(tables, "project-studio-enforcement", addSyntheticUser(tables, 10), SEED_DB_KEYS.users.user1, 3620), /STUDIO membership limit is 10.*current team count is 10/);
});

test("Beta eleventh active or reserved member is blocked", () => {
  const tables = createServerSeedTables();
  assignBeta(tables, SEED_DB_KEYS.users.user2);
  createOwner(tables, "project-beta-enforcement", SEED_DB_KEYS.users.user2);
  for (let index = 11; index <= 18; index += 1) {
    addActiveMember(tables, "project-beta-enforcement", addSyntheticUser(tables, index), SEED_DB_KEYS.users.user2, 3700 + index);
  }
  inviteMember(tables, "project-beta-enforcement", addSyntheticUser(tables, 19), SEED_DB_KEYS.users.user2, 3720);
  const state = readProjectTeamState(tables, { projectKey: "project-beta-enforcement" });
  assert.equal(state.ownerMembership.plan.code, "BETA");
  assert.equal(state.reservedSeatCount, 10);
  assert.throws(() => inviteMember(tables, "project-beta-enforcement", addSyntheticUser(tables, 20), SEED_DB_KEYS.users.user2, 3730), /BETA membership limit is 10.*current team count is 10/);
});

test("joining a stale invitation re-checks the current active team limit", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "STUDIO");
  createOwner(tables, "project-stale-invite", SEED_DB_KEYS.users.user1);
  const invited = inviteMember(tables, "project-stale-invite", SEED_DB_KEYS.users.user2, SEED_DB_KEYS.users.user1, 3800);
  for (let index = 21; index <= 28; index += 1) {
    addActiveMember(tables, "project-stale-invite", addSyntheticUser(tables, index), SEED_DB_KEYS.users.user1, 3800 + index);
  }
  assignPlan(tables, SEED_DB_KEYS.users.user1, "CREATOR", 3850);
  assert.throws(() => joinProjectMember(tables, {
    memberKey: invited.member.key,
    projectKey: "project-stale-invite",
  }, options(3860)), /CREATOR membership limit is 3.*Invitation cannot be accepted/);
});

test("removed member loses project access immediately", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "CREATOR");
  createOwner(tables, "project-access-enforcement", SEED_DB_KEYS.users.user1);
  addActiveMember(tables, "project-access-enforcement", SEED_DB_KEYS.users.user2, SEED_DB_KEYS.users.user1, 3900);
  assert.equal(assertProjectMemberAccess(tables, {
    projectKey: "project-access-enforcement",
    userKey: SEED_DB_KEYS.users.user2,
  }).status, "PASS");
  removeProjectMember(tables, {
    projectKey: "project-access-enforcement",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(3910));
  assert.throws(() => assertProjectMemberAccess(tables, {
    projectKey: "project-access-enforcement",
    userKey: SEED_DB_KEYS.users.user2,
  }), /status is removed/);
});

test("last owner cannot be removed or demoted by role changes", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "CREATOR");
  createOwner(tables, "project-owner-enforcement", SEED_DB_KEYS.users.user1);
  assert.throws(() => removeProjectMember(tables, {
    projectKey: "project-owner-enforcement",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(3920)), /owner member cannot be removed/);
  assert.throws(() => changeProjectMemberRole(tables, {
    projectKey: "project-owner-enforcement",
    role: "editor",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(3930)), /preserve at least one active owner/);

  addActiveMember(tables, "project-owner-enforcement", SEED_DB_KEYS.users.user2, SEED_DB_KEYS.users.user1, 3940);
  const changed = changeProjectMemberRole(tables, {
    projectKey: "project-owner-enforcement",
    role: "viewer",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(3950));
  assert.equal(changed.member.role, "viewer");
});
