# BUILD_PR_LEVEL_8_23_WORKSPACE_MANIFEST_GAMES_FIELD_ALIGNMENT

## Audit Finding From PR 8.22
Workspace manifests were present and structurally detected:

- `workspace.manifest.json`
- `tmp/new-work-space-workspace.project.json`

Both:
- use `schema` logical id
- include `documentKind`, `schema`, and `version`
- are missing root `games`

Current `tools/schemas/workspace.schema.json` requires `games`.

## Required Fix
For every workspace manifest governed by `tools/schemas/workspace.schema.json`:

1. Ensure root field exists:
```json
"games": []
```

2. If the manifest already has equivalent game/workspace entries under another key, migrate or mirror them into `games` without data loss.

3. Preserve:
- `documentKind`
- `schema`
- `version`
- existing workspace metadata

4. Do not add sample concepts:
- no `samples`
- no `phase`
- no `sampleId`

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:

- Advance `Verify all 17 tools have exactly one schema` to `[x]` if still true.
- Advance `Verify sample tool payload files match workspace/game tools[] item shape` to `[x]` based on PR 8.22 sample audit.
- Advance `Verify palette/shared data never embeds inside tool payload files` to `[x]` based on PR 8.21 audit.
- Advance `Verify workspace schema has no sample-only concepts` to `[x]` if confirmed after this PR.
- Add/advance `Workspace manifests include schema-required games field` to `[.]` or `[x]` based on execution.

## Acceptance
- All workspace manifests governed by workspace schema contain root `games`.
- Workspace schema remains free of sample-only concepts.
- No runtime files changed.
- No validators added.
- No `start_of_day` changes.
