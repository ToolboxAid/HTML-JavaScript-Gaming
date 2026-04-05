MODEL: GPT-5.4-codex
REASONING: high

Create BUILD_PR_OVERLAY_DATA_PROVIDERS

Follow PLAN_PR -> BUILD_PR -> APPLY_PR

Requirements:
- Docs-first unless APPLY explicitly needs code guidance notes
- No engine core changes
- One PR per purpose
- Keep integration sample-level
- Use MultiSystemDemoScene.js as the integration reference
- Define a clean read-only provider layer for Debug Overlay panels
- Preserve the Dev Console = command/control boundary
- Preserve the Debug Overlay = telemetry/visual boundary
- Panels must consume provider snapshots instead of direct runtime reads
- Include recommended provider IDs, descriptor shape, guardrails, validation, accomplishments summary, and next-step recommendations
- Write outputs under docs/pr and docs/dev/reports
- Package to <project folder>/tmp/BUILD_PR_OVERLAY_DATA_PROVIDERS_delta.zip
