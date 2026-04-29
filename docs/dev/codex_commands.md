MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 11.42.

Remove `buildDefaultPayload` from:
- 3D Asset Viewer
- 3D Camera Path Editor
- 3D JSON Payload Normalizer

This cleanup supports the explicit sample JSON/input contract from PR 11.41.

Rules:
- Do not fabricate payloads.
- Do not auto-load hidden defaults.
- Do not create fallback sample geometry/camera/path data.
- When no payload/input exists, show a safe empty state explaining explicit JSON/input is required.
- Preserve behavior when explicit payload/input is provided.
- Keep changes limited to the listed tools and direct shared helpers only if required.

Search terms:
- buildDefaultPayload
- 3d asset viewer
- 3d camera path editor
- 3d json payload normalizer
- payload normalizer

Do NOT:
- change unrelated tools
- change sample 1902 workspace payload except as needed for correct explicit-input messaging
- undo SVG Asset Studio rename
- touch start_of_day folders

Validation:
Run targeted syntax checks for changed JS files.
Run:
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --tools

If full smoke is too broad, run relevant targeted smoke and document why.

Reports:
Write:
docs/dev/reports/PR_11_42_validation.txt

Report must include:
- files changed
- each removed buildDefaultPayload location
- new no-input behavior for each tool
- validation command results
