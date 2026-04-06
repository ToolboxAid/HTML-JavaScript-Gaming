MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PLAN_PR_DEBUG_SURFACES_NETWORK_SUPPORT, BUILD_PR_DEBUG_SURFACES_NETWORK_SUPPORT, and APPLY_PR_DEBUG_SURFACES_NETWORK_SUPPORT as a bundled docs pack

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- One PR purpose per document, but package all three together
- Plan/build/apply the first reusable network support layer for the debug surfaces platform
- Define shared network panels, shared network providers, optional shared network presets, adapter boundaries, adoption models, naming conventions, and target structure
- Keep the first version summary-level and opt-in
- Exclude protocol-specific implementations, packet inspectors, auth/matchmaking tooling, and deep inspectors from this bundle
- Keep transport/protocol adapters outside the shared layer
- Update BIG_PICTURE_ROADMAP.md by changing bracket states only
- Include ROADMAP_GUARDRAILS.md unchanged
- Package to <project folder>/tmp/DEBUG_SURFACES_NETWORK_SUPPORT_BUNDLE.zip
