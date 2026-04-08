MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_25_GUARD_SELFTEST_RUNNER.md exactly.
Edit only these files:
- tools/dev/checkSharedExtractionGuard.selftest.mjs (new file)
- tools/dev/checkSharedExtractionGuard.mjs (only if a minimal export is strictly required)
Fail fast if tools/dev/checkSharedExtractionGuard.mjs does not exist.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_25_GUARD_SELFTEST_RUNNER_delta.zip
