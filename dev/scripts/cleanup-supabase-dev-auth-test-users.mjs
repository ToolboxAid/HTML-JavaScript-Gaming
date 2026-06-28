#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { cleanupSupabaseDevAuthTestUsers } from "../../api/testing/supabase-dev-auth-test-user-cleanup.mjs";

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
      loadedKeys: [],
      path: envPath,
    };
  }
  const loadedKeys = [];
  readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      return;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || String(process.env[key] || "").trim()) {
      return;
    }
    process.env[key] = parseEnvValue(trimmed.slice(separatorIndex + 1));
    loadedKeys.push(key);
  });
  return {
    loaded: true,
    loadedKeys,
    path: envPath,
  };
}

function parseArgs(argv) {
  const auditUserKeyIndex = argv.indexOf("--audit-user-key");
  const auditUserKey = auditUserKeyIndex === -1 ? "" : String(argv[auditUserKeyIndex + 1] || "").trim();
  return {
    auditUserKey: auditUserKey || String(process.env.SUPABASE_DEV_AUTH_TEST_CLEANUP_AUDIT_USER_KEY || process.env.npm_config_audit_user_key || "").trim(),
    dryRun: argv.includes("--dry-run") || process.env.SUPABASE_DEV_AUTH_TEST_CLEANUP_DRY_RUN === "1" || process.env.npm_config_dry_run === "true",
    json: argv.includes("--json") || process.env.SUPABASE_DEV_AUTH_TEST_CLEANUP_JSON === "1" || process.env.npm_config_json === "true",
  };
}

function formatRecord(record) {
  return `${record.email || "(missing-email)"} userKey=${record.userKey || "(missing-user-key)"}`;
}

function formatAuditDependency(record) {
  return `${record.table}.${record.rowKey || "(missing-row-key)"} fields=${record.fields.join(",")}`;
}

function printTextReport(result, envLoad) {
  console.log("Supabase DEV auth test user cleanup");
  console.log(envLoad.loaded
    ? `.env.local loaded (${envLoad.loadedKeys.length} key(s) applied).`
    : ".env.local was not found.");
  console.log(`Mode: ${result.dryRun ? "DRY-RUN" : "DELETE"}`);
  console.log(`Created test records: ${result.createdRecords.length}`);
  result.createdRecords.forEach((record) => {
    console.log(`CREATE ${formatRecord(record)}`);
  });
  console.log(`Candidate test records: ${result.testDataCandidates}`);
  console.log(`Deleted test records: ${result.testDataDeleted}`);
  result.deletedRecords.forEach((record) => {
    console.log(`DELETE ${formatRecord(record)} authUserDeleted=${record.authUserDeleted ?? "dry-run"} authUserNotFound=${record.authUserNotFound ?? "dry-run"} roleAuditReferencesReassigned=${record.roleAuditReferencesReassigned ?? "dry-run"} userRolesDeleted=${record.userRolesDeleted ?? "dry-run"} userRoleAuditReferencesReassigned=${record.userRoleAuditReferencesReassigned ?? "dry-run"} usersDeleted=${record.usersDeleted ?? "dry-run"}`);
  });
  console.log(`Audit reassignment required: ${result.auditReassignmentRequired ? "YES" : "NO"}`);
  console.log(`Audit dependency records: ${result.auditDependencyRecords.length}`);
  result.auditDependencyRecords.forEach((record) => {
    console.log(`AUDIT_DEPENDENCY ${formatAuditDependency(record)}`);
  });
  console.log(`Audit reassignment records: ${result.auditReassignmentRecords.length}`);
  result.auditReassignmentRecords.forEach((record) => {
    console.log(`AUDIT_REASSIGN userKey=${record.userKey} roleAuditReferencesReassigned=${record.roleAuditReferencesReassigned} userRoleAuditReferencesReassigned=${record.userRoleAuditReferencesReassigned}`);
  });
  console.log(`Skipped non-test records: ${result.skippedRecords.length}`);
  console.log(`Overall Result: ${result.status}`);
}

const options = parseArgs(process.argv.slice(2));
const envLoad = loadEnvLocal();
const result = await cleanupSupabaseDevAuthTestUsers({
  auditUserKey: options.auditUserKey,
  dryRun: options.dryRun,
});

if (options.json) {
  console.log(JSON.stringify({
    envLocalLoaded: envLoad.loaded,
    ...result,
  }, null, 2));
} else {
  printTextReport(result, envLoad);
}
