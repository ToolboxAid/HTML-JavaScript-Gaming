# Level 8.26 User Blockers

## Scope
Captured blocker questions from `BUILD_PR_LEVEL_8_26_MANIFEST_SSOt_AND_UNUSED_JSON_AUDIT` and recorded current decisions from this execution.

## Root / Manifest Questions
1. Why does root `workspace.manifest.json` still contain `samples`?
- Decision: **Blocker remains open**. Current file still contains `samples`; this PR audited and documented, but did not perform broad manifest migration.

2. What is root `package-lock.json` for?
- Decision: npm lockfile for reproducible dependency resolution. Keep at repo root.

3. Is root `package.json` only unit-test related; should it move under `tests/`?
- Decision: No. It is the repo npm entrypoint (scripts/dependencies), not test-only. Keep at root.

4. Difference between `tools.manifest.json` and `workspace.asset-catalog.json`?
- Decision: Current split is dual-source:
  - `workspace.asset-catalog.json` = workspace/runtime asset catalog.
  - `tools.manifest.json` = tool lineage/runtime/toolData mapping.
  This is an SSoT conflict risk.

5. Single manifest passed to Workspace Editor and opened with Workspace Manager?
- Decision: Recommended target remains one game/workspace manifest SSoT with other views derived.

## Asteroids / Games Questions
6. Should `bezel.stretch.override.json` be in manifest SSoT?
- Decision: Yes if it participates in runtime/workspace asset graph.
- Current audit: **not referenced** by Asteroids manifests.

7. Should `asteroids-classic.palette.json` and `hud.json` be in manifest SSoT including Primitive Skin Editor section?
- Decision: Yes for shared game/workspace ownership visibility.
- Current audit:
  - `asteroids-classic.palette.json` referenced.
  - `hud.json` not referenced.

8. Should game asset folders avoid `assets/<tool>/data/` when direct asset ownership works?
- Decision: Prefer explicit direct ownership paths where possible; no file moves in this PR.

9. Apply same checks to all games?
- Decision: Completed in per-game manifest SSoT audit report.

10. Palette swatches should not end with `FFFFFFFF` when `FFFFFF` is sufficient.
- Decision: Implemented where found in tracked palette JSON files.

## Tool Launch / Palette Browser Questions
11. Why does `sample.0213.palette-browser.json` exist?
- Decision: It is a tool payload for a sample that explicitly launches palette browser.

12. Confirm payload/data split (`palette-browser` payload vs `sample.<id>.palette.json` shared data)?
- Decision: Confirmed. Tool payload and palette data remain separate concerns.

## Deletion / Cleanup Questions
13. Can delete `tools/codex/sample_maaping_example.json`?
- Decision: Path not found in repo. No deletion performed.

14. Can delete `tools/dev/checkPhase24*` and `tools/dev/checkSharedExt*.json`?
- Decision: No. Baseline JSON files are referenced by guard scripts/reports.

15. Can delete `tools/samples/*`?
- Decision: No files found under `tools/samples` in current repo.

16. Can delete `tools/shared/samples/*`?
- Decision: No. Referenced by validation script/docs; not proven unused.

17. Audit rest of `tools/` JSON and delete unused only.
- Decision: Completed audit. No safe deletion candidate proven unused under required reference checks.

18. Remove all sample dropdown/select support in tools.
- Decision: Follow-up required; intentionally not implemented in this audit PR.

19. Migrate tool-local samples to `/samples/phase-*` where needed.
- Decision: Follow-up required; not executed in this audit PR.

20. If files are not wired, wire or mark deletion.
- Decision: Marked unreferenced assets in manifest SSoT report; no destructive cleanup without dedicated wiring/migration PR.

## Root File Audit Notes
- `workspace.manifest.json`: still contains `samples` and now also contains `games`; boundary conflict remains tracked.
- `package.json`: root npm entrypoint with test/build/guard scripts.
- `package-lock.json`: dependency lock state for deterministic installs.
