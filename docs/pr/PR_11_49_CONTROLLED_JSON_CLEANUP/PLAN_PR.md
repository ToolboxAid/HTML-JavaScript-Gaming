# PLAN_PR_LEVEL_11_49_CONTROLLED_JSON_CLEANUP

## Purpose
Continue controlled sample JSON cleanup using the audit signal, limited to two safe tool-specific `NO` items.

## Mode
CONTROLLED CLEANUP MODE.

This PR is not a refactor, not a mass delete, and not a tooling expansion.

## Scope
- Run `scripts/PS/audit-sample-json-js-references.ps1`.
- Select exactly two `NO` JSON files that are tool-specific and clearly safe.
- Prefer safe tool-specific payloads such as profiler, replay, pipeline, 3D utility/tool payloads.
- Manually inspect each selected JSON file and nearby JS/tool references before modifying anything.
- For each selected item, decide one of:
  - indirectly used → keep and document why
  - wrong sample/location → move only if clearly correct
  - dead/unreferenced → delete only when confirmed
- Update roadmap status markers only if there is an execution-backed cleanup roadmap item already present.

## Explicit Exclusions
Do not touch:
- `palette.json`
- `tile-map-editor-document.json`
- sample `1902`
- roadmap text except status marker transitions `[ ] -> [.]` or `[.] -> [x]`
- shared loader/framework files unless required to validate a selected item

## Acceptance Criteria
- Audit script was run and output captured in `docs/dev/reports/PR_11_49_audit_before.txt`.
- Exactly two safe `NO` items were selected and documented.
- Each selected item has a manual validation note.
- Any delete/move is supported by no JS references and no indirect usage found.
- Targeted validation is run only for affected samples/tools.
- Full sample suite is skipped unless shared loader/framework changes are made.
- Final report documents changed files, test commands, and full-suite decision.

## Testing Rule
Do not run the full samples smoke test by default. It takes about 20 minutes.

Run only targeted checks:
- syntax checks for changed JS/JSON files
- affected sample/tool launch checks if available
- rerun audit script after changes

