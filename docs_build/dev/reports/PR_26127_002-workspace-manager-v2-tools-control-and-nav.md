# PR_26127_002-workspace-manager-v2-tools-control-and-nav

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Moved Workspace Manager V2 launch tiles into their own accordion control above Workspace Context.
- Labeled the new Workspace Manager V2 control `Tools`.
- Kept Workspace Manager V2 tool tile launch behavior unchanged.
- Made Workspace Context summary tiles a consistent fixed height.
- Added a `Workflow` group to `toolbox/index.html` above `Editors`.
- Moved Workspace Manager V2 into the `Workflow` group while preserving `Editors`, `Utilities`, and `Viewers`.
- Kept tile action labels as `How To Use`, `Read Me`, and `Samples (x)`.

## Validation

- `npm run test:workspace-v2` - PASS, 24 Playwright tests.
- `git diff --check` - PASS with only Git line-ending warnings.
- Scope check: no changes under `toolbox/workspace-v2` or `samples`.
- Full samples smoke test skipped by request; this PR is Workspace Manager V2 UI/nav scoped.

## Playwright Impacted

Yes. This PR changes Workspace Manager V2 UI layout and the tools index navigation grouping.

Validated behavior:
- Tools index shows `Workflow`, `Editors`, `Utilities`, and `Viewers` in that order.
- Workspace Manager V2 appears in the `Workflow` group and not in `Utilities`.
- Tool card action labels use `How To Use`, `Read Me`, and `Samples (x)` formatting.
- Workspace Manager V2 has a separate `Tools` accordion above `Workspace Context`.
- Tool tiles are no longer nested in Workspace Context.
- Workspace Context summary tiles render at a consistent height.
- Workspace Manager V2 tool tile launches and Return to Workspace behavior remain valid.

Expected pass behavior:
- Workspace Manager V2 launches from toolbox/index.html under `Workflow`.
- Workspace Manager V2 shows the `Tools` control above `Workspace Context`.
- Workspace Context summary tiles align at the same height.

Expected fail behavior:
- Invalid manifests still block export and log schema errors.
- Direct Asset Manager V2 workspace query launch remains blocked.

## Manual Validation Notes

1. Open `/toolbox/index.html`.
2. Confirm `Workflow` appears above `Editors`, followed by `Utilities` and `Viewers`.
3. Confirm Workspace Manager V2 appears under `Workflow`.
4. Confirm tool card actions read `How To Use`, `Read Me`, and `Samples (x)` where sample links exist.
5. Open `/toolbox/workspace-manager-v2/index.html`.
6. Confirm the center panel shows `Tools` above `Workspace Context`.
7. Load Asteroids and confirm Workspace Context summary tiles have matching heights.
8. Launch a tile, return to Workspace, and confirm the active context remains restored.

Out of scope:
- Full samples smoke test.
- Deprecated `toolbox/workspace-v2`.
- Sample JSON changes.

