/*
Toolbox Aid
David Quesenberry
06/02/2026
ContractReportStandardization.test.mjs
*/
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const CONTRACT_REPORT_PATHS = Object.freeze([
  "docs_build/dev/reports/audit_event_contract_tests_validation.md",
  "docs_build/dev/reports/backup_snapshot_contract_tests_validation.md",
  "docs_build/dev/reports/collaboration_role_contract_tests_validation.md",
  "docs_build/dev/reports/contract_chain_validation.md",
  "docs_build/dev/reports/contract_fixture_isolation_validation.md",
  "docs_build/dev/reports/contract_index_validation.md",
  "docs_build/dev/reports/contract_negative_case_coverage.md",
  "docs_build/dev/reports/contract_report_standardization.md",
  "docs_build/dev/reports/creator_profile_contract_tests_validation.md",
  "docs_build/dev/reports/download_grant_contract_tests_validation.md",
  "docs_build/dev/reports/entitlement_contract_tests_validation.md",
  "docs_build/dev/reports/identity_permissions_contract_tests_validation.md",
  "docs_build/dev/reports/install_receipt_contract_tests_validation.md",
  "docs_build/dev/reports/library_item_contract_tests_validation.md",
  "docs_build/dev/reports/manifest_contract_tests_validation.md",
  "docs_build/dev/reports/marketplace_listing_contract_tests_validation.md",
  "docs_build/dev/reports/marketplace_transaction_boundary_contract_tests_validation.md",
  "docs_build/dev/reports/migration_plan_contract_tests_validation.md",
  "docs_build/dev/reports/moderation_queue_contract_tests_validation.md",
  "docs_build/dev/reports/notification_contract_tests_validation.md",
  "docs_build/dev/reports/organization_contract_tests_validation.md",
  "docs_build/dev/reports/project_contract_tests_validation.md",
  "docs_build/dev/reports/project_workspace_contract_rename_validation.md",
  "docs_build/dev/reports/publish_contract_tests_validation.md",
  "docs_build/dev/reports/release_contract_tests_validation.md",
  "docs_build/dev/reports/restore_snapshot_contract_tests_validation.md",
  "docs_build/dev/reports/review_rating_contract_tests_validation.md",
  "docs_build/dev/reports/tool_state_contract_tests_validation.md",
  "docs_build/dev/reports/update_channel_contract_tests_validation.md",
  "docs_build/dev/reports/version_compatibility_contract_tests_validation.md",
]);

const REQUIRED_REPORT_ANCHORS = Object.freeze([
  "## Lanes Executed",
  "## Lanes Skipped",
  "## Samples Decision",
  "Playwright impacted: No",
  "## Blocker Scope",
  "## Manual Validation",
]);

export function run() {
  assert.equal(CONTRACT_REPORT_PATHS.length, 30, "active contract report standardization count");

  for (const reportPath of CONTRACT_REPORT_PATHS) {
    const report = readReport(reportPath);

    for (const anchor of REQUIRED_REPORT_ANCHORS) {
      assert.equal(report.includes(anchor), true, `${reportPath} includes ${anchor}`);
    }

    assert.match(report, /contract/i, `${reportPath} names the contract lane`);
    assert.match(report, /samples/i, `${reportPath} states the samples decision`);
    assert.match(report, /manual validation/i, `${reportPath} states manual validation`);
    assert.match(report, /blocker scope/i, `${reportPath} states blocker scope`);
  }
}

function readReport(reportPath) {
  const resolvedPath = path.join(repoRoot, reportPath);
  assert.equal(fs.existsSync(resolvedPath), true, `${reportPath} exists`);
  return fs.readFileSync(resolvedPath, "utf8");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run();
}
