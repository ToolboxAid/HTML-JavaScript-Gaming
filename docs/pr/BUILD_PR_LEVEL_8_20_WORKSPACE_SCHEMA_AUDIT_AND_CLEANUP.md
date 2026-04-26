# BUILD_PR_LEVEL_8_20_WORKSPACE_SCHEMA_AUDIT_AND_CLEANUP

## Objective
Verify workspace schema is workspace/game focused and does not contain sample-only concepts.

## Audit Targets
- `tools/schemas/workspace.schema.json`
- workspace/game manifest files, if present
- roadmap status section

## Forbidden in workspace.schema.json
- `samples`
- `sampleId`
- sample-only `phase` requirement
- sample launch semantics
- sample tool payload file naming rules

## Allowed in workspace.schema.json
- `documentKind`
- `schema`
- `version`
- `games`
- `level`
- `tools`
- workspace/game shared data references

## Required Roadmap Movement
In `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`:
- Advance `Verify all 17 tools have exactly one schema` from `[.]` to `[x]` if 17/17 schema coverage is confirmed.
- Advance `Verify sample tool payload files match workspace/game tools[] item shape` from `[.]` to `[x]` based on PR 8.19 audit result.
- Advance `Verify workspace schema has no sample-only concepts` from `[ ]` to `[.]`.

## Acceptance
- Workspace schema contains no sample-only concepts.
- Roadmap updates are status-only.
- Report documents findings.
- No runtime/start_of_day changes.
