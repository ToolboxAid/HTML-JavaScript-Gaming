chatGPT executed:
- Created the docs-only APPLY_PR package for PR-006
- Wrote apply docs under /docs/prs/PR-006-engine-game-repo-export-scan-execution/
- Kept scope docs-only and preserved compatibility
- Did not change runtime behavior, imports, file locations, or execution paths

User to execute:
- Do not run Codex for APPLY_PR
- Download the zip, extract it, drag/drop into the repo root, and commit
- Then run the Codex command below in VS Code against the local repo to perform the factual export scan

model: GPT-5.3-codex
reasoning: high
codex command: Scan the actual engine/game module entry files in ToolboxAid/HTML-JavaScript-Gaming and record the real export surface under /docs/prs/PR-006-engine-game-repo-export-scan-execution. Capture export names exactly as exposed, defining files, re-export files where applicable, direct exports versus re-exports, preserve compatibility, and do not change runtime behavior, imports, file locations, or execution paths.
