MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Follow PLAN_PR -> BUILD_PR -> APPLY_PR

Create BUILD_PR_OVERLAY_PANEL_PERSISTENCE

Requirements:
- Docs-first unless BUILD/APPLY implementation work is explicitly requested
- No engine core changes in this PR
- One PR per purpose
- Keep integration sample-level
- Use MultiSystemDemoScene.js as the integration reference
- Add a clean overlay persistence adapter boundary
- Persist overlay panel enabled/disabled state only
- Registry remains runtime source of truth
- Operator commands save through public APIs only
- Handle invalid/unknown stored panel ids safely
- Add versioned snapshot shape
- Write outputs under docs/pr and docs/dev/reports
- Package to <project folder>/tmp/BUILD_PR_OVERLAY_PANEL_PERSISTENCE_delta.zip

NEXT RECOMMENDED COMMAND:
Create PLAN_PR_DEBUG_SURFACES_ENGINE_PROMOTION

Requirements:
- Docs-only
- Evaluate whether dev console and debug overlay should move into engine core
- Compare promotion options: keep sample-owned, move to engine debug package, or partial core extraction
- Preserve console vs overlay separation
- Define promotion criteria, boundaries, risks, and rollout phases
- Do not implement core migration yet
