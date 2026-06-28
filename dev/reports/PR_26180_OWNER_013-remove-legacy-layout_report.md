# PR_26180_OWNER_013-remove-legacy-layout Report

Generated: 2026-06-28T23:33:01.682Z
Team: Owner
Mode: BUILD_PR
Branch: PR_26180_OWNER_013-remove-legacy-layout
Base dependency: PR_26180_OWNER_012-update-ci-and-scripts
Stack order: after PR_26180_OWNER_012, before final layout validation

## Purpose

Remove active obsolete legacy layout references after the www/api/dev migration stack, without changing product behavior or moving the new www/api/dev files.

## Scope Summary

- Updated Project Instructions, project state, backlog, and repository layout plan to version 2026.06.28.013 and this PR's migration status.
- Retired active references to obsolete filesystem paths such as root tests/, docs_build/, root toolbox filesystem references, and dev/build/dev contract spec paths.
- Updated dev test helpers and validation evidence to use canonical dev/tests, www/, and dev/build/ProjectInstructions paths.
- Kept public URL compatibility references such as /toolbox, /assets, and /games intentionally intact.
- Updated www/owner/notes.html only to point its Admin Notes status/help text at the archived dev location already used by the service.

## Files Changed

- dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
- dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS_VERSION.md
- dev/build/ProjectInstructions/PROJECT_STATE.md
- dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md
- dev/build/ProjectInstructions/repository/repository_layout_architecture_plan.md
- dev/reports/PR_26180_OWNER_013-remove-legacy-layout_branch-validation.md
- dev/reports/PR_26180_OWNER_013-remove-legacy-layout_manual-validation-notes.md
- dev/reports/PR_26180_OWNER_013-remove-legacy-layout_report.md
- dev/reports/PR_26180_OWNER_013-remove-legacy-layout_requirement-checklist.md
- dev/reports/PR_26180_OWNER_013-remove-legacy-layout_validation-report.md
- dev/reports/codex_changed_files.txt
- dev/reports/codex_review.diff
- dev/tests/dev-runtime/AdminNotesBoundary.test.mjs
- dev/tests/dev-runtime/ApiMenuPathCleanup.test.mjs
- dev/tests/final/ToolchainEngineIntegrationValidation.test.mjs
- dev/tests/fixtures/games/AsteroidsValidation.test.mjs.patch
- dev/tests/fixtures/tools/VectorNativeTemplate.test.mjs.patch
- dev/tests/fixtures/workspace-v2/uat.manifest.json
- dev/tests/helpers/playwrightV8CoverageReporter.mjs
- dev/tests/helpers/testCoverageCatalog.mjs
- dev/tests/playwright_installation.txt
- dev/tests/production/TestsValidationCombinedPass.test.mjs
- dev/tests/runtime/V2BlockFakeSessionSave.test.mjs
- dev/tests/runtime/V2ClearStaleMergePreview.test.mjs
- dev/tests/runtime/V2ConfirmPreviewEnableState.test.mjs
- dev/tests/runtime/V2CrossToolFlow.test.mjs
- dev/tests/runtime/V2CrossToolMergeBlock.test.mjs
- dev/tests/runtime/V2DeterministicStateTransitions.test.mjs
- dev/tests/runtime/V2DiffViewerMessaging.test.mjs
- dev/tests/runtime/V2DiffViewerSummaryCounts.test.mjs
- dev/tests/runtime/V2EnableStateFeedback.test.mjs
- dev/tests/runtime/V2MergeConflictSummary.test.mjs
- dev/tests/runtime/V2MergeOutputPersistence.test.mjs
- dev/tests/runtime/V2MergePreviewOverlayFix.test.mjs
- dev/tests/runtime/V2MergeResultSummary.test.mjs
- dev/tests/runtime/V2MergeStateSingleSourceOfTruth.test.mjs
- dev/tests/runtime/V2MergeStateStatusReset.test.mjs
- dev/tests/runtime/V2MergedRecentSessionRegistration.test.mjs
- dev/tests/runtime/V2SaveLibraryFromRecentSession.test.mjs
- dev/tests/runtime/V2SavedSessionRowActions.test.mjs
- dev/tests/runtime/V2SelectionSyncRowActions.test.mjs
- dev/tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- dev/tests/runtime/V2SessionLibraryActionLabel.test.mjs
- dev/tests/runtime/V2SessionLibraryActions.test.mjs
- dev/tests/runtime/V2SessionLibraryCardOverwrite.test.mjs
- dev/tests/runtime/V2SessionLibrarySaveGuard.test.mjs
- dev/tests/runtime/V2SessionStateModelConsolidation.test.mjs
- dev/tests/runtime/V2SessionToolsCloseoutBundle.test.mjs
- dev/tests/runtime/V2SessionUxStabilization.test.mjs
- dev/tests/runtime/V2ToolLaunch.test.mjs
- dev/tests/runtime/V2UndoButtonRender.test.mjs
- dev/tests/runtime/V2UndoEnableStateActualAvailability.test.mjs
- dev/tests/runtime/V2UndoEnableStateRefresh.test.mjs
- dev/tests/runtime/V2UndoLastMerge.test.mjs
- dev/tests/runtime/V2WorkspaceDefaultToolInitialization.test.mjs
- dev/tests/schemas/tool.manifest.schema.json
- dev/tests/shared/ContractFixtureIsolationValidation.test.mjs
- dev/tests/shared/ContractIndexValidation.test.mjs
- dev/tests/shared/ContractNegativeCaseCoverage.test.mjs
- dev/tests/tools/ToolManifestBoundary.test.mjs
- www/owner/notes.html

## Legacy Layout Decision

No tracked root legacy folders were removed because git tracking showed no active tracked files under obsolete root locations such as docs_build/, tests/, archive/, tmp/, projects/, scripts/, project-instructions/, dev/docs_build/, dev/project-instructions/, dev/workspace/artifacts/, or dev/build/dev/.

Local ignored or untracked legacy-looking files were left untouched and were not staged.

## Compatibility Notes

Browser public routes remain unchanged. References to /toolbox, /assets, /games, /account, /admin, and related public URLs are compatibility routes, not obsolete filesystem references.

## Dependency Order

- Previous dependency: PR_26180_OWNER_012-update-ci-and-scripts
- Current PR: PR_26180_OWNER_013-remove-legacy-layout
- Next dependency: final layout validation PR

## Owner Recommendation

Ready for review after validation, with no product behavior changes and no new feature scope.
