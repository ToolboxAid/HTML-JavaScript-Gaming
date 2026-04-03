Toolbox Aid
David Quesenberry
04/03/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4
REASONING: high

PRIMARY COMMAND
Create `BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION` for the HTML-JavaScript-Gaming repo. Implement the approved Sprite Editor project integration contract from `PLAN_PR_SPRITE_EDITOR_PROJECT_INTEGRATION` with small, surgical changes only. Enforce disabled-until-selected paint/stroke behavior, preserve locked palette behavior after explicit selection, persist and restore palette references safely across save/load, and keep new/load/import/resize/duplicate flows contract-compliant. Do not broaden scope beyond Sprite Editor project integration. Refresh `docs/dev/reports/change_summary.txt`, `docs/dev/reports/validation_checklist.txt`, and `docs/dev/reports/file_tree.txt`, and package a repo-structured ZIP to `<project folder>/tmp/BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION_delta.zip`.

COMMIT COMMENT
`build(sprite-editor): integrate project palette selection and persistence contracts`

NEXT COMMAND
MODEL: GPT-5.4
REASONING: high
COMMAND: After BUILD validation is complete, create `APPLY_PR_SPRITE_EDITOR_PROJECT_INTEGRATION` that verifies final repo readiness, confirms project-format compatibility, summarizes user-visible behavior changes, and packages the final repo-structured delta ZIP.
