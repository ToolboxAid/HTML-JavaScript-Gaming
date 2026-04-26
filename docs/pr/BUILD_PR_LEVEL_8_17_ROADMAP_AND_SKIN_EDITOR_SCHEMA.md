# BUILD_PR_LEVEL_8_17_ROADMAP_AND_SKIN_EDITOR_SCHEMA

## Purpose
This BUILD PR creates the roadmap tracking structure required by project instructions and advances the current schema lane with the smallest testable change: adding the missing `skin-editor` tool schema.

## Files to Change

### 1. `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`
Update status only where existing Level 8 items already exist.

If Level 8 schema-driven tool normalization section does not exist, append this section without deleting or rewriting existing roadmap text:

```md
## Level 8 — Schema-Driven First-Class Tool Normalization

- [x] Canonical 17 first-class tool inventory documented.
- [x] Tool folder paths verified for all 17 first-class tools.
- [x] Explicit schema paths recorded for all 17 first-class tools.
- [.] Close first-class schema gap by adding `tools/schemas/tools/skin-editor.schema.json`.
- [.] Define launcher pairing contract: pass tool payload object plus shared data objects.
- [ ] Verify all 17 tools have exactly one schema.
- [ ] Verify sample tool payload files match workspace/game `tools[]` item shape.
- [ ] Verify palette/shared data never embeds inside tool payload files.
- [ ] Verify workspace schema has no sample-only concepts.
```

### 2. `tools/schemas/tools/skin-editor.schema.json`
Add the missing first-class tool schema for `skin-editor`.

Required shape:
- `$schema`
- `$id`
- `type: object`
- `required: ["tool", "version", "config"]`
- `tool.const: "skin-editor"`
- `version` accepts string or integer
- `config` object
- `additionalProperties: false`

### 3. `docs/dev/reports/level_8_17_roadmap_and_skin_editor_schema_report.md`
Add validation report.

Required report checks:
- roadmap section exists
- roadmap movement used only `[ ] -> [.]` or `[.] -> [x]`
- `skin-editor.schema.json` exists
- 17 first-class tools remain planned
- no runtime files changed
- no `start_of_day` files changed

## Acceptance
- Roadmap updated without deleting or rewriting existing roadmap content.
- Roadmap status advances at least one item.
- `tools/schemas/tools/skin-editor.schema.json` exists.
- First-class schema coverage can advance from 16/17 to 17/17.
- No runtime/start_of_day changes.
