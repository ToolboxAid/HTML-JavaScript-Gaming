MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_17_ENFORCEMENT_GUARD.md exactly.
Edit only these repo files:
- tools/dev/checkSharedExtractionGuard.mjs (new file)
- package.json (only if it already exists and already has a scripts section; add only the one script if missing)
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_17_ENFORCEMENT_GUARD_delta.zip
