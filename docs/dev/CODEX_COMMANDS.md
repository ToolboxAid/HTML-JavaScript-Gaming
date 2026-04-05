MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_OVERLAY_OPERATOR_COMMANDS

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- One PR per purpose
- No engine core changes
- Keep integration sample-level
- Use MultiSystemDemoScene.js as the integration target
- Register overlay.* operator commands through the Dev Console command registry
- Use only approved public overlay/registry APIs
- Support: overlay.help, overlay.list, overlay.status, overlay.show <panelId>, overlay.hide <panelId>, overlay.toggle <panelId>, overlay.showAll, overlay.hideAll, overlay.order
- Provide deterministic operator-readable outputs
- Fail safely on invalid or missing panel IDs
- Keep everything debug-only
- Validate with node --check and sample command execution
- Write docs under docs/pr and reports under docs/dev/reports
- Package to <project folder>/tmp/BUILD_PR_OVERLAY_OPERATOR_COMMANDS_delta.zip
