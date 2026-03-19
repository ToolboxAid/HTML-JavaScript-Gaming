chatGPT executed:
- Created the docs-only BUILD_PR package for PR-006 results stage
- Recorded that verified local scan results were not available in this session
- Preserved compatibility and avoided unverified repo claims
- Did not change runtime behavior, imports, file locations, or execution paths

User to execute:
- Run this in VS Code against the local repo
- Then provide the verified results back for the next zip-based BUILD_PR with actual recorded outputs

model: GPT-5.3-codex
reasoning: high
codex command: Scan the actual engine/game module entry files in ToolboxAid/HTML-JavaScript-Gaming and record the verified export surface under /docs/prs/PR-006-engine-game-repo-export-scan-results. Capture export names exactly as exposed, defining files, re-export files where applicable, direct exports versus re-exports, factual compatibility notes only when explicitly visible, preserve compatibility, and do not change runtime behavior, imports, file locations, or execution paths.
