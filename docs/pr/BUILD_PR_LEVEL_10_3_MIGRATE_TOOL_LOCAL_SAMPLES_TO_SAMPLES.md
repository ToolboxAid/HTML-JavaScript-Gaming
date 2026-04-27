# BUILD_PR_LEVEL_10_3_MIGRATE_TOOL_LOCAL_SAMPLES_TO_SAMPLES

## Objective
Make `/samples` the only home for samples.

## Tools To Process
1. `tools/Vector Map Editor`
2. `tools/Vector Asset Studio`
3. `tools/Parallax Scene Studio`
4. `tools/Tilemap Studio`

The user says each has three samples. Codex must discover the actual local sample/demo files.

## Placement Rules
Pick the correct `/samples/phase-*` location based on existing repo organization.

Rules:
- Preserve current sample phase numbering conventions.
- Do not reuse existing sample IDs.
- Continue the next available sample IDs in the correct phase.
- Keep sample folder naming consistent:
  - `samples/phase-XX/####/`
- Each migrated sample should have:
  - `index.html`
  - sample tool payload file(s), if needed
  - any manifest/data needed by that sample
- Update `samples/index.html`.

## Suggested Classification
Use the current sample phase taxonomy if already present:
- Vector Map Editor samples → vector/map/tool integration phase.
- Vector Asset Studio samples → vector asset/tool integration phase.
- Parallax Scene Studio samples → parallax/rendering/tool integration phase.
- Tilemap Studio samples → tilemap/tool integration phase.

If phase placement is ambiguous, use the closest existing phase containing related tool samples and document the decision.

## Tool Cleanup Rule
After migrated samples exist and launch:
- remove those sample options from tool-local dropdown/select UI
- tools should no longer show internal sample choices
- tools should accept explicit manifest/tool input only

Do not remove generic "Open" or "Load" functionality for real workspace/game data.

## Required Audit
Create:

```text
docs/dev/reports/level_10_3_tool_local_sample_migration_report.md
```

Report:
- source tool
- source sample/demo path
- destination sample path
- assigned phase/id
- files moved/copied
- tool-local sample UI removed/retained
- launch test result

## Required Tests
Update or add tests to verify:
- migrated samples appear in `samples/index.html`
- migrated samples launch from `/samples`
- old tool-local sample dropdown/select entries are gone
- tools still open with explicit input

## Acceptance
- Tool-local samples from the four tools are migrated to `/samples`.
- `samples/index.html` includes the migrated samples.
- Migrated samples launch.
- Tool-local sample dropdown/select entries are removed.
- No duplicate sample IDs.
- No `start_of_day` changes.
- Delta ZIP returned.
