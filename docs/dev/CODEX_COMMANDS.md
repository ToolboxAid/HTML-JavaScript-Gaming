MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Follow PLAN_PR -> BUILD_PR -> APPLY_PR.

Create OVERLAY_PANEL_REGISTRY_delta focused on a clean contract for overlay panels.

Requirements:
- Docs-first planning/bundle structure unless explicitly executing BUILD/APPLY implementation
- One PR per purpose
- No engine core changes
- Keep integration sample-level
- Preserve Dev Console vs Debug Overlay boundary
- Use MultiSystemDemoScene.js as the integration reference
- Define and/or implement an OverlayPanelRegistry with deterministic ordering
- Define panel descriptor validation and approved panel context boundaries
- Allow only approved console interactions through public registry calls
- Reject direct panel-to-console coupling and overlay host special cases
- Write PR docs to docs/pr/
- Write commit comment and next command under docs/dev/
- Write reports under docs/dev/reports/
- Package as <project folder>/tmp/OVERLAY_PANEL_REGISTRY_delta.zip
