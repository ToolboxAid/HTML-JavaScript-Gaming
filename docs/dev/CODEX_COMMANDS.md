MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PLAN_PR_DEBUG_SURFACES_STANDARD_LIBRARY

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- One PR per purpose
- Plan the first reusable standard library for promoted debug surfaces
- Define shared panels, shared providers, shared operator commands, adoption models, naming conventions, and target structure
- Keep the initial library small and opt-in
- Exclude 3D-specific, network-specific, and deep-inspector work from this PR
- Keep project-specific panels/providers/commands outside the shared library
- Write outputs under docs/pr and docs/dev/reports
- Put codex command and commit comment under docs/dev
- Package to <project folder>/tmp/PLAN_PR_DEBUG_SURFACES_STANDARD_LIBRARY_delta.zip
