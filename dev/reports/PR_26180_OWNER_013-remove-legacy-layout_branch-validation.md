# PR_26180_OWNER_013-remove-legacy-layout Branch Validation

Generated: 2026-06-28T23:33:01.682Z

| Check | Result | Evidence |
|---|---|---|
| Current branch | PASS | PR_26180_OWNER_013-remove-legacy-layout |
| Expected branch | PASS | PR_26180_OWNER_013-remove-legacy-layout |
| Stacked base | PASS | PR_26180_OWNER_012-update-ci-and-scripts is an ancestor of HEAD |
| Worktree reviewed | PASS | Only governance, dev test/reference cleanup, reports, and one path-copy Owner page update are in scope |
| Runtime behavior change | PASS | No product behavior change intended |
| New www/api/dev files moved | PASS | No move of new www/api/dev application files in this PR |
| Legacy folders deleted | PASS | No tracked legacy folders remained to delete; untracked/ignored local files left untouched |

HEAD at start of report: b802afcd33b892d33610a577b160cb096fe2e721

## Current Status Snapshot

```text
M dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
 M dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS_VERSION.md
 M dev/build/ProjectInstructions/PROJECT_STATE.md
 M dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md
 M dev/build/ProjectInstructions/repository/repository_layout_architecture_plan.md
 M dev/tests/dev-runtime/AdminNotesBoundary.test.mjs
 M dev/tests/dev-runtime/ApiMenuPathCleanup.test.mjs
 M dev/tests/final/ToolchainEngineIntegrationValidation.test.mjs
 M dev/tests/fixtures/games/AsteroidsValidation.test.mjs.patch
 M dev/tests/fixtures/tools/VectorNativeTemplate.test.mjs.patch
 M dev/tests/fixtures/workspace-v2/uat.manifest.json
 M dev/tests/helpers/playwrightV8CoverageReporter.mjs
 M dev/tests/helpers/testCoverageCatalog.mjs
 M dev/tests/playwright_installation.txt
 M dev/tests/production/TestsValidationCombinedPass.test.mjs
 M dev/tests/runtime/V2BlockFakeSessionSave.test.mjs
 M dev/tests/runtime/V2ClearStaleMergePreview.test.mjs
 M dev/tests/runtime/V2ConfirmPreviewEnableState.test.mjs
 M dev/tests/runtime/V2CrossToolFlow.test.mjs
 M dev/tests/runtime/V2CrossToolMergeBlock.test.mjs
 M dev/tests/runtime/V2DeterministicStateTransitions.test.mjs
 M dev/tests/runtime/V2DiffViewerMessaging.test.mjs
 M dev/tests/runtime/V2DiffViewerSummaryCounts.test.mjs
 M dev/tests/runtime/V2EnableStateFeedback.test.mjs
 M dev/tests/runtime/V2MergeConflictSummary.test.mjs
 M dev/tests/runtime/V2MergeOutputPersistence.test.mjs
 M dev/tests/runtime/V2MergePreviewOverlayFix.test.mjs
 M dev/tests/runtime/V2MergeResultSummary.test.mjs
 M dev/tests/runtime/V2MergeStateSingleSourceOfTruth.test.mjs
 M dev/tests/runtime/V2MergeStateStatusReset.test.mjs
 M dev/tests/runtime/V2MergedRecentSessionRegistration.test.mjs
 M dev/tests/runtime/V2SaveLibraryFromRecentSession.test.mjs
 M dev/tests/runtime/V2SavedSessionRowActions.test.mjs
 M dev/tests/runtime/V2SelectionSyncRowActions.test.mjs
 M dev/tests/runtime/V2SessionLibraryActionCleanup.test.mjs
 M dev/tests/runtime/V2SessionLibraryActionLabel.test.mjs
 M dev/tests/runtime/V2SessionLibraryActions.test.mjs
 M dev/tests/runtime/V2SessionLibraryCardOverwrite.test.mjs
 M dev/tests/runtime/V2SessionLibrarySaveGuard.test.mjs
 M dev/tests/runtime/V2SessionStateModelConsolidation.test.mjs
 M dev/tests/runtime/V2SessionToolsCloseoutBundle.test.mjs
 M dev/tests/runtime/V2SessionUxStabilization.test.mjs
 M dev/tests/runtime/V2ToolLaunch.test.mjs
 M dev/tests/runtime/V2UndoButtonRender.test.mjs
 M dev/tests/runtime/V2UndoEnableStateActualAvailability.test.mjs
 M dev/tests/runtime/V2UndoEnableStateRefresh.test.mjs
 M dev/tests/runtime/V2UndoLastMerge.test.mjs
 M dev/tests/runtime/V2WorkspaceDefaultToolInitialization.test.mjs
 M dev/tests/schemas/tool.manifest.schema.json
 M dev/tests/shared/ContractFixtureIsolationValidation.test.mjs
 M dev/tests/shared/ContractIndexValidation.test.mjs
 M dev/tests/shared/ContractNegativeCaseCoverage.test.mjs
 M dev/tests/tools/ToolManifestBoundary.test.mjs
 M www/owner/notes.html
```
