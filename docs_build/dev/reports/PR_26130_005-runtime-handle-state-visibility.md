# PR_26130_005-runtime-handle-state-visibility

## Summary

- Added serializable runtime binding metadata to Workspace Manager V2 repo references and hydrated tool `workspace` sections: `hasLiveRepoHandle`, `sourceBindingState`, `boundManifestPath`, and `bindingSource`.
- Kept live FileSystem handles out of sessionStorage, persisted toolState context, and Session Inspector JSON; stored metadata only.
- Session Inspector V2 now logs runtime binding status for selected repo/tool entries without rendering a handle object.
- Workspace Manager V2 now logs runtime handle acquired, rebound, lost, and invalidated states.

## Scope

Changed only Workspace Manager V2 runtime binding visibility/status, Session Inspector V2 visibility, and the Workspace Manager V2 Playwright coverage.

No `start_of_day` files were modified.

## Validation

- `node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `node --check tools/session-inspector-v2/js/SessionInspectorV2App.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "loads Gravity Well|restores sessionStorage toolState read-only|rebinds restored session Save"`: 3 passed
- `npm run test:workspace-v2`: 22 passed
- `git diff --check`: passed

Full samples smoke test was skipped because this PR is limited to Workspace Manager V2 runtime handle visibility/status and does not modify shared sample loading, sample manifests, or broad sample runtime behavior.

## Playwright Coverage

Playwright impacted: Yes.

Validated behavior:

- Repo selection stores runtime binding visibility metadata in `workspace.repo.reference`.
- Hydrated tool workspace sessions include save-capable binding metadata while the active workspace manifest remains free of runtime-only fields.
- Session Inspector V2 shows runtime binding status metadata for repo/tool entries and does not render `handle`, `repoHandle`, or `fileSystemHandle` objects.
- Restored sessionStorage toolState without a live repo folder handle reports `hasLiveRepoHandle=false`, keeps Save disabled, and logs the required rebind action.
- Repo folder selection rebinds the restored toolState to the real `game.manifest.json` source and restores save-capable metadata.

Expected pass behavior: runtime metadata is visible, serializable, and accurate; Save remains disabled without a live handle and enabled only for dirty toolState with a live binding.

Expected fail behavior: tests fail if runtime metadata is missing, a live handle object appears in session/tool JSON, Session Inspector omits binding status, or Save becomes available without a live writable binding.

## V8 Coverage

Runtime JavaScript coverage from `npm run test:workspace-v2`:

- `(88%) tools/workspace-manager-v2/js/WorkspaceManagerV2App.js - executed lines 913/913; executed functions 42/48`
- `(90%) tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js - executed lines 1502/1502; executed functions 140/155`
- `(93%) tools/session-inspector-v2/js/SessionInspectorV2App.js - executed lines 337/337; executed functions 42/45`

Guardrail warnings: none.

## Manual Test

1. Open `tools/workspace-manager-v2/index.html`.
2. Pick the repo folder and open Asteroids.
3. Launch Session Inspector V2 from the Workspace Manager V2 tool tiles.
4. Select `workspace.repo.reference` and `workspace.tools.asset-manager-v2`.
5. Expected: JSON/status show `hasLiveRepoHandle`, `sourceBindingState`, `boundManifestPath`, and `bindingSource`; no live handle object is rendered.
6. Return to Workspace Manager V2.
7. Expected: repo/game/tool enablement and Save/Close dirty-state behavior remain intact.

Out of scope: full sample launch validation. Sample smoke remains skipped until a dedicated sample alignment phase.

## Changed Files

- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26130_005-runtime-handle-state-visibility.md`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/session-inspector-v2/js/SessionInspectorV2App.js`
- `tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
