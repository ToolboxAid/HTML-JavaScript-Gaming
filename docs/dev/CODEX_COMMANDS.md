MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Follow PLAN_PR + BUILD_PR + APPLY_PR.

Create OVERLAY_BOUNDARY_delta.

Requirements:
- Keep docs-first workflow for this bundle
- No engine core changes
- One PR purpose only: Dev Console vs Debug Overlay boundary
- Keep integration sample-level
- Use MultiSystemDemoScene.js as the integration reference
- Preserve the distinction:
  - Dev Console = command/input surface
  - Debug Overlay = passive visual telemetry/HUD
- Document allowed interactions, prohibited coupling, public contract candidates, ownership matrix, validation goals, and rollout notes
- Write outputs under docs/pr and docs/dev
- Write reports under docs/dev/reports
- Package to <project folder>/tmp/OVERLAY_BOUNDARY_delta.zip
