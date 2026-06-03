# PR 11.164 Revert Map

## Objective
Provide the smallest evidence-backed rollback plan for SVG tile/shared-shell badge churn (starting PR 11.154) without introducing another behavior fix in this PR.

## Ownership Anchor
- Visible `Asset: none` output owner remains the shared shell renderer path in `tools/shared/platformShell.js`.
- Therefore rollback planning must prioritize shell-lane churn before touching unrelated contracts.

## Tier 1: Immediate Safe Reverts (No Runtime Risk)
These are dead/placeholder artifacts and can be reverted first.

1. `docs_build/dev/reports/svg_payload_to_shared_asset_badge_11_161.txt`
- Reason: empty file (`0` bytes)
- Ledger class: `REVERT`

2. `docs_build/dev/reports/pr_11_162_evidence_template.txt`
- Reason: template-only placeholder; not execution evidence
- Ledger class: `REVERT`

3. `docs_build/dev/reports/pr_11_163_delivery_manifest.md`
- Reason: packaging metadata only; no diagnostic/runtime value
- Ledger class: `REVERT`

## Tier 2: Conditional Reverts (Gate On Targeted Validation)
These paths are churned but potentially still carrying useful partial behavior. Revert only with owner-path validation proof.

1. `tools/shared/platformShell.js` (staged/uncommitted SVG badge branches)
- Current class: `INVESTIGATE`
- Why conditional: this file emits the visible badge; blind revert may remove both failed and useful wiring.
- Minimal rollback strategy:
  - Revert only post-11.158 SVG-specific badge fallback additions in `renderToolAssetBadge` and adjacent helper branches if a controlled A/B check shows no regression in non-SVG tools.
  - Preserve non-SVG generic badge behavior and existing handoff API contracts.

2. `tools/Workspace Manager/main.js`
- Current class: `UNKNOWN`
- Why conditional: PR 11.156-11.158 edits were in this file, but evidence shows visible badge owner moved to shared shell.
- Minimal rollback strategy:
  - Do not revert wholesale.
  - If future proof confirms no consumer for specific SVG label priming branches, prune only those isolated branches.

## Tier 3: Keep Set (Process/Evidence Docs)
Keep these as chain-of-custody and execution evidence for the failed lane:
- `docs_build/pr/BUILD_PR_LEVEL_11_155_TRACE_SVG_ASSET_NONE_SOURCE.md`
- `docs_build/pr/BUILD_PR_LEVEL_11_156_INSTRUMENT_SVG_CARD_RENDER_SOURCE.md`
- `docs_build/pr/BUILD_PR_LEVEL_11_157_FIX_WORKSPACE_TILE_SUMMARY_DISPLAY_MODEL.md`
- `docs_build/pr/BUILD_PR_LEVEL_11_158_FORCE_FIX_LITERAL_ASSET_NONE_RENDERER.md`
- `docs_build/pr/BUILD_PR_LEVEL_11_159_FIX_ACTIVE_SHARED_ASSET_TILE_RENDERER.md`
- `docs_build/pr/BUILD_PR_LEVEL_11_160_FIX_SHARED_SHELL_SVG_ASSET_BADGE_COMPATIBILITY.md`
- `docs_build/pr/BUILD_PR_LEVEL_11_161_WIRE_SVG_PAYLOAD_TO_SHARED_ASSET_BADGE.md`
- `docs_build/pr/PR_11_162.md`
- `docs_build/pr/PR_11_163_FREEZE_BADGE_CHURN_AND_TRACE_HANDOFF.md`
- `docs_build/pr/PR_11_164_DEAD_CODE_LEDGER_AND_REVERT_MAP.md`
- `docs_build/dev/reports/svg_asset_none_trace_11_155.txt`
- `docs_build/dev/reports/svg_card_render_source_11_156.txt`
- `docs_build/dev/reports/workspace_tile_summary_display_model_11_157.txt`
- `docs_build/dev/reports/literal_asset_none_renderer_11_158.txt`
- `docs_build/dev/reports/active_asset_tile_renderer_11_159.txt`
- `docs_build/dev/reports/pr_11_163_handoff_trace_report.md`
- `docs_build/dev/reports/pr_11_164_dead_code_ledger.md`

## Next PR Boundary (Post-Audit)
- Next implementation PR should be owner-scoped to `tools/shared/platformShell.js` only.
- Validate with targeted checks only (no full smoke):
  - `node --check tools/shared/platformShell.js`
  - launch sample 1902 path and verify visible `Asset:` badge row text.

## Runtime Safety Statement
- This PR performs audit/report generation only.
- No runtime behavior changes were applied.