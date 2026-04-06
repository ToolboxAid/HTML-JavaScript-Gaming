MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DEBUG_SURFACES_PRESETS

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- One PR per purpose
- Build the first reusable presets system for promoted debug surfaces
- Define authoritative target structure, shared preset inventory, preset commands, precedence rules with persistence, adoption modes, validation goals, and rollback strategy
- Keep the first version small and opt-in
- Focus only on panel visibility and optional ordering
- Exclude layout editors, docking systems, role permissions, 3D-specific, network-specific, and project-specific preset implementations from the shared layer
- Use DebugPresetRegistry, DebugPresetApplier, registerStandardDebugPresets(), and registerPresetCommands()
- Write outputs under docs/pr and docs/dev/reports
- Put codex command and commit comment under docs/dev
- Package to <project folder>/tmp/BUILD_PR_DEBUG_SURFACES_PRESETS_delta.zip
