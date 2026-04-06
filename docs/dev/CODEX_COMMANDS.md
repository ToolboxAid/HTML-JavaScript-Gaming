MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PLAN_PR_DEBUG_SURFACES_3D_SUPPORT

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- One PR per purpose
- Plan the first reusable 3D support layer for the debug surfaces platform
- Define shared 3D panels, shared 3D providers, optional 3D presets, adapter boundaries, adoption models, naming conventions, and target structure
- Keep the first version summary-level and opt-in
- Exclude renderer-specific implementations, deep inspectors, and network support from this PR
- Keep project-specific renderer/scene adapters outside the shared layer
- Write outputs under docs/pr and docs/dev/reports
- Put codex command and commit comment under docs/dev
- Update BIG_PICTURE_ROADMAP.md by changing bracket states only
- Package to <project folder>/tmp/PLAN_PR_DEBUG_SURFACES_3D_SUPPORT_delta.zip
