# LEVEL_11_2_EXPANSION_CRITERIA

Expansion is allowed ONLY if:
- Feature gate ON shows no regressions
- Feature gate OFF matches 10.7 behavior exactly
- Tests fully pass
- No cross-layer coupling detected
- No mutation outside transitions
- Consumer remains read-only and stable

If ANY fail -> HOLD
