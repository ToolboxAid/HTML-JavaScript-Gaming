# PR_26130_006-preview-generator-handle-write-verification

## Summary

- Preview Generator V2 workspace launch now restores the live Workspace Manager V2 repo `FileSystemDirectoryHandle` instead of creating a session-backed synthetic repo writer.
- `preview.svg` writes are verified by re-reading the live handle target before `OK WRITE` is logged.
- Write logs now separate repo display label, repo root path string, handle root name, handle-relative output path, and absolute display path.
- SVG write verification logs file existence, file size, modified timestamp when available, SVG-start detection, output path, and handle-relative path.
- Absolute display paths are no longer compared directly against handle-relative paths, removing the false path mismatch warning.

## Scope

Changed only Preview Generator V2 live repo handle restoration/path/write verification and Workspace Manager V2 Playwright coverage for that behavior.

No `start_of_day` files were modified.

## Handle Source

The live handle is resolved from Workspace Manager V2 runtime state, not passed through or serialized inside toolState JSON.

Preview Generator V2 reads `workspace.repo.reference`, then restores the matching live repo handle from the Workspace Manager V2 repo handle cache:

- Test/runtime hook: `window.__workspaceManagerV2RepoHandleCache.restore({ reference })`
- Browser fallback: IndexedDB cache `workspace-manager-v2-repo-handles` / `repo-handles` / `active-repo-handle`

`manifest.repoPath` is used for repo root path string and absolute display path reporting. It is not used as the write authority and is not compared as if it were handle-relative.

If no live Workspace Manager V2 repo handle can be restored, Preview Generator V2 logs the exact restore failure and required recovery action, leaves generation disabled, and does not claim `OK WRITE`.

## Validation

- `node --check tools/preview-generator-v2/PreviewGeneratorV2RepoAccess.js`
- `node --check tools/preview-generator-v2/PreviewGeneratorV2App.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npm run test:workspace-v2`: 23 passed
- `git diff --check`: passed

Full samples smoke test was skipped because this PR is limited to Preview Generator V2 handle/path/write verification and does not modify shared sample loading, sample manifests, or broad sample runtime behavior.

## Playwright Coverage

Playwright impacted: Yes.

Validated behavior:

- Preview Generator V2 restores the Workspace Manager V2 live repo handle through `workspace.repo.reference` plus the runtime handle cache.
- `preview.svg` writes are performed through the live handle and verified by read-back before `OK WRITE`.
- Write logs include normalized path fields and SVG verification metadata.
- Handle-relative output paths are not treated as mismatches against absolute display paths.
- A forced read-back verification failure logs `FAIL`, records `Failed: 1`, and never logs `OK WRITE`.

Expected fail behavior: tests fail if Preview Generator V2 silently falls back to session-only writes, logs `OK WRITE` before successful read-back verification, or resurrects the absolute-vs-handle-relative mismatch warning.

## Coverage Notes

Runtime JavaScript coverage from `npm run test:workspace-v2` included changed Preview Generator V2 files:

- `(88%) tools/preview-generator-v2/PreviewGeneratorV2App.js - changed JS file with browser V8 coverage`
- `(28%) tools/preview-generator-v2/PreviewGeneratorV2RepoAccess.js - advisory low coverage; cache restore branches include browser API and failure-path guards`

`tests/playwright/tools/WorkspaceManagerV2.spec.mjs` is a changed test file and is not collected as browser runtime coverage.

## Manual Test

1. Open Workspace Manager V2.
2. Pick the repo folder and open Asteroids.
3. Launch Preview Generator V2 from the Workspace Manager V2 tool tiles.
4. Generate the workspace preview.
5. Expected: status log shows live handle restoration, write read-back verification, normalized path fields, and `OK WRITE Asteroids`.
6. Expected: no absolute path versus handle-relative path mismatch warning appears.

Out of scope: full sample smoke validation. Sample smoke remains skipped until a dedicated sample/runtime validation phase.

## Changed Files

- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/reports/PR_26130_006-preview-generator-handle-write-verification.md`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/preview-generator-v2/PreviewGeneratorV2App.js`
- `tools/preview-generator-v2/PreviewGeneratorV2RepoAccess.js`
