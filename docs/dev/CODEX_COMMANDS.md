MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Apply APPLY_PR_DEBUG_SURFACES_3D_SUPPORT

Requirements:
- Execute the 3D support APPLY step only
- Create summary-level shared 3D providers, shared 3D panels, and optional shared 3D presets
- Keep renderer-specific adapters and scene extraction outside the shared layer
- Preserve existing provider/panel/preset conventions
- Do not add deep inspectors, renderer-specific implementations, or network support
- Validate with a 3D sample or local adapter harness
- Update BIG_PICTURE_ROADMAP.md by changing bracket states only
- Include ROADMAP_GUARDRAILS.md unchanged
- Package to <project folder>/tmp/APPLY_PR_DEBUG_SURFACES_3D_SUPPORT_delta.zip
