MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- One PR per purpose
- Build the first shared standard library under engine/debug/standard
- Define authoritative target structure, initial inventory, registration pattern, adoption modes, validation goals, and rollback strategy
- Keep the initial library small and opt-in
- Exclude 3D-specific, network-specific, deep-inspector, and project-specific logic from this PR
- Use `registerStandardDebugPreset()` as the main shared adoption entry point
- Write outputs under docs/pr and docs/dev/reports
- Put codex command and commit comment under docs/dev
- Package to <project folder>/tmp/BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY_delta.zip
