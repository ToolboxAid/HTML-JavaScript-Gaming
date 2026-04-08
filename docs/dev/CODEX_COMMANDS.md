MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_19_REMOVE_ALIAS_BOOTSTRAP_JSCONFIG_ONLY.md exactly.
Edit only this file:
- jsconfig.json
Fail fast unless jsconfig.json exists and exactly matches the alias-only bootstrap content in the BUILD doc, and the 4 listed slice files no longer use @shared imports.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_19_REMOVE_ALIAS_BOOTSTRAP_JSCONFIG_ONLY_delta.zip
