chatGPT executed:
- Created the docs-only BUILD_PR package for PR-006
- Recorded that the actual repo export scan could not be verified in this environment
- Preserved compatibility and avoided unverified scan results
- Did not change runtime behavior, imports, file locations, or execution paths

User to execute:
- Run this in VS Code against the actual local repo to perform the factual export scan
- Then use the resulting verified outputs for the next zip-based step

model: GPT-5.3-codex
reasoning: high
codex command: Scan the actual engine/game module entry files in ToolboxAid/HTML-JavaScript-Gaming and record the real export surface under /docs/prs/PR-006-engine-game-repo-export-scan-execution. Capture export names exactly as exposed, defining files, re-export files where applicable, direct exports versus re-exports, preserve compatibility, and do not change runtime behavior, imports, file locations, or execution paths.
