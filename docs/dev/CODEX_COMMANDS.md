MODEL: GPT-5.3-codex
REASONING: low

COMMAND:
Execute BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT.

Do not ask for clarification.

Create exactly:
- docs/dev/reports/engine_import_baseline_report.md
- docs/dev/reports/engine_import_contract_decision.md
- docs/dev/reports/BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT_report.md
- docs/dev/reports/validation_checklist.txt

Required work:
1. Baseline current `/src/engine/` usage across src/, games/, samples/, tools/, and relevant HTML files.
2. Summarize whether the current import style is already a stable baseline contract.
3. Do NOT rewrite imports in this PR.
4. Do NOT move files or folders.
5. Do NOT touch templates/archive lanes.
6. Do NOT change anything under:
   - docs/dev/start_of_day/chatGPT/
   - docs/dev/start_of_day/codex/

If exact roadmap lines already exist and are justified by findings, bracket-only state updates are allowed.
Otherwise, record unapplied delta and leave roadmap wording untouched.

Package output to:
<project folder>/tmp/BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT.zip
