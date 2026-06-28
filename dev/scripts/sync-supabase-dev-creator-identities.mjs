#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { syncSupabaseDevCreatorIdentities } from "../../api/testing/supabase-dev-creator-identity-seed-sync.mjs";

function parseEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return {
      loaded: false,
      loadedKeys: 0,
      path: envPath,
    };
  }
  let loadedKeys = 0;
  readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) {
      return;
    }
    const key = normalized.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || String(process.env[key] || "").trim()) {
      return;
    }
    process.env[key] = parseEnvValue(normalized.slice(separatorIndex + 1));
    loadedKeys += 1;
  });
  return {
    loaded: true,
    loadedKeys,
    path: envPath,
  };
}

function formatCounts(label, counts) {
  console.log(`${label}: auth=${counts.authUsers}, public.users=${counts.publicUsers}, canonical auth=${counts.canonicalAuthUsers}, canonical public=${counts.canonicalPublicUsers}, extra auth=${counts.managedExtraAuthUsers}, extra public=${counts.managedExtraPublicUsers}`);
}

function formatRecordList(label, records, selector) {
  if (!records.length) {
    console.log(`${label}: none`);
    return;
  }
  console.log(`${label}:`);
  records.forEach((record) => {
    console.log(`- ${selector(record)}`);
  });
}

const args = new Set(process.argv.slice(2));
const json = args.has("--json");
const dryRun = args.has("--dry-run");
const updatePasswords = args.has("--update-passwords");
const envLoad = loadEnvLocal();

try {
  const result = await syncSupabaseDevCreatorIdentities({ dryRun, updatePasswords });
  if (json) {
    console.log(JSON.stringify({
      envLocalLoaded: envLoad.loaded,
      envLocalLoadedKeys: envLoad.loadedKeys,
      updatePasswords,
      ...result,
    }, null, 2));
  } else {
    console.log(`Supabase DEV creator identity sync: ${result.status}`);
    console.log(envLoad.loaded
      ? `.env.local loaded (${envLoad.loadedKeys} key(s) applied).`
      : ".env.local was not found.");
    console.log(`Password updates for existing Auth users: ${updatePasswords ? "enabled" : "disabled"}.`);
    formatCounts("Before", result.beforeCounts);
    formatCounts("After", result.afterCounts);
    formatRecordList("Auth upserts", result.authUpsertRecords, (record) => `${record.email}: ${record.action}`);
    formatRecordList("User role repairs", result.userRoleRepair.deletedRecords, (record) => `${record.userKey}: ${record.reason} roleKey=${record.roleKey} action=${record.action}`);
    formatRecordList("Deprecated role user_roles cleanup", result.roleArtifactCleanup.deletedUserRoleRecords, (record) => `${record.userKey}: roleKey=${record.roleKey} action=${record.action}`);
    formatRecordList("Deprecated role cleanup", result.roleArtifactCleanup.deletedRoleRecords, (record) => `${record.roleSlug}: key=${record.key} action=${record.action}`);
    formatRecordList("Deleted DEV accounts", result.deletedRecords, (record) => `${record.email || "(no email)"}: ${record.action || "deleted"} userKey=${record.userKey || "(auth-only)"}`);
    formatRecordList("Auth/public sync evidence", result.verification.identityEvidence, (record) => `${record.email}: auth=${record.authUserPresent ? "present" : "missing"}, public.users=${record.publicUserPresent ? record.publicUserKey : "missing"}, synced=${record.synced ? "yes" : "no"}`);
    formatRecordList("Creator role assignments", result.verification.creatorAssignments, (record) => `${record.email}: ${record.assigned ? "assigned" : "missing"}`);
    console.log(`DavidQ role=admin assignment preserved: ${result.verification.davidqAdminAssignmentPreserved ? "yes" : "no"}`);
    console.log(`DavidQ role=owner assignment preserved: ${result.verification.davidqOwnerAssignmentPreserved ? "yes" : "no"}`);
    console.log(`Role evidence: User 1 creator=${result.verification.roleEvidence.user1Creator ? "PASS" : "FAIL"}, User 2 creator=${result.verification.roleEvidence.user2Creator ? "PASS" : "FAIL"}, User 3 creator=${result.verification.roleEvidence.user3Creator ? "PASS" : "FAIL"}, DavidQ creator=${result.verification.roleEvidence.davidqCreator ? "PASS" : "FAIL"}, DavidQ admin=${result.verification.roleEvidence.davidqAdmin ? "PASS" : "FAIL"}, DavidQ owner=${result.verification.roleEvidence.davidqOwner ? "PASS" : "FAIL"}.`);
    console.log(`Known stale role key removed: ${result.userRoleRepair.staleRoleKeyRemoved ? "yes" : "no"}`);
    console.log(`Legacy user role deleted: ${result.verification.legacyUserRoleDeleted ? "yes" : "no"}`);
    console.log(`Verification failures: ${result.verification.failures.length ? result.verification.failures.join(", ") : "none"}`);
  }
  if (!dryRun && result.status !== "PASS") {
    process.exitCode = 1;
  }
} catch (error) {
  if (json) {
    console.log(JSON.stringify({
      envLocalLoaded: envLoad.loaded,
      envLocalLoadedKeys: envLoad.loadedKeys,
      error: error instanceof Error ? error.message : String(error || "Unknown sync error."),
      status: "FAIL",
    }, null, 2));
  } else {
    console.error(`Supabase DEV creator identity sync failed: ${error instanceof Error ? error.message : String(error || "Unknown sync error.")}`);
  }
  process.exitCode = 1;
}
