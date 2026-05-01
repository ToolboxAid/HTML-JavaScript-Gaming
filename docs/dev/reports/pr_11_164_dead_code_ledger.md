# PR 11.164 Dead Code Ledger

## Scope Baseline
- Audit baseline: `PR 11.154` commit `32979aae`.
- Lane audited: SVG tile/shared-shell badge troubleshooting from PR 11.154 onward (including current uncommitted churn files).

## Evidence Commands
- `git log --oneline --decorate --grep "PR 11\.154|PR_11_154|11\.154" -n 20`
- `git diff --name-status 32979aae..HEAD`
- `git status --short`
- targeted file inspection of PR/build docs and report artifacts
- `git diff --cached -- tools/shared/platformShell.js`

## Classification Legend
- `KEEP`: proven useful evidence or process source-of-truth
- `REVERT`: failed/dead artifact; safe to remove
- `UNKNOWN`: not proven harmful or required yet
- `INVESTIGATE`: likely ownership path for broken behavior

## Path Ledger (PR 11.154+ Badge Lane)
| Path | Class | Evidence | Recommendation |
|---|---|---|---|
| `tools/shared/platformShell.js` | INVESTIGATE | Owns visible badge emission path (`renderToolAssetBadge` -> `Asset: ...` template). Contains staged 11.160+ wiring churn branches. | Keep under investigation; no new behavior edits in this PR. |
| `tools/Workspace Manager/main.js` | UNKNOWN | Changed in PR 11.156-11.158. Reports indicate this path was patched repeatedly while visible badge persisted. | Avoid blind revert; isolate only if owner-path validation proves redundant. |
| `docs/dev/codex_commands.md` | KEEP | Repro command provenance across attempts. | Keep. |
| `docs/dev/commit_comment.txt` | KEEP | Commit-intent provenance for audit lane. | Keep. |
| `docs/dev/reports/svg_asset_none_trace_11_155.txt` | KEEP | Captures early function/branch trace and failure hypothesis. | Keep as diagnostic history. |
| `docs/dev/reports/svg_card_render_source_11_156.txt` | KEEP | Documents instrumented render-source trace attempt. | Keep as evidence. |
| `docs/dev/reports/workspace_tile_summary_display_model_11_157.txt` | KEEP | Records summary-display model adjustment attempt and rationale. | Keep as evidence. |
| `docs/dev/reports/literal_asset_none_renderer_11_158.txt` | KEEP | Confirms literal `Asset: none` renderer was not in Workspace Manager text templates. | Keep; key boundary evidence. |
| `docs/dev/reports/active_asset_tile_renderer_11_159.txt` | KEEP | Identifies active renderer shift toward shared shell lane. | Keep; key ownership evidence. |
| `docs/dev/reports/shared_shell_svg_asset_badge_11_160.txt` | UNKNOWN | Describes compatibility broadening in shared shell; issue remained unresolved. | Retain temporarily; final disposition after validated owner fix. |
| `docs/dev/reports/svg_payload_to_shared_asset_badge_11_161.txt` | REVERT | Empty (`0` bytes), no evidentiary content. | Remove/revert. |
| `docs/dev/reports/pr_11_162_dead_wiring_report.txt` | UNKNOWN | Documents dead-branch assertions but symptom persisted. | Keep temporarily pending final validated fix/rollback. |
| `docs/dev/reports/pr_11_162_evidence_template.txt` | REVERT | Template placeholder not replaced with execution evidence. | Remove/revert. |
| `docs/dev/reports/pr_11_163_delivery_manifest.md` | REVERT | Delivery manifest metadata; no diagnostic/runtime insight. | Remove/revert. |
| `docs/dev/reports/pr_11_163_handoff_trace_report.md` | KEEP | Freeze trace explicitly maps badge ownership to shared shell emitter path. | Keep as primary handoff evidence. |
| `docs/dev/reports/pr_11_164_expected_outputs.md` | KEEP | Defines required PR 11.164 artifact set. | Keep. |
| `docs/dev/reports/pr_11_164_build_notes.md` | KEEP | Corrects baseline from 11.159 to 11.154 for this audit pass. | Keep. |
| `docs/dev/reports/pr_11_164_badge_ownership_map.md` | UNKNOWN | Useful ownership summary, but superseded by required 11.164 revert-map output. | Optional retain; not required final artifact. |
| `docs/dev/reports/pr_11_164_dead_code_ledger.md` | KEEP | This required ledger artifact (updated to 11.154 baseline). | Keep. |
| `docs/pr/BUILD_PR_LEVEL_11_155_TRACE_SVG_ASSET_NONE_SOURCE.md` | KEEP | Source-of-truth scope for 11.155 attempt. | Keep as process record. |
| `docs/pr/BUILD_PR_LEVEL_11_156_INSTRUMENT_SVG_CARD_RENDER_SOURCE.md` | KEEP | Source-of-truth scope for 11.156 attempt. | Keep as process record. |
| `docs/pr/BUILD_PR_LEVEL_11_157_FIX_WORKSPACE_TILE_SUMMARY_DISPLAY_MODEL.md` | KEEP | Source-of-truth scope for 11.157 attempt. | Keep as process record. |
| `docs/pr/BUILD_PR_LEVEL_11_158_FORCE_FIX_LITERAL_ASSET_NONE_RENDERER.md` | KEEP | Source-of-truth scope for 11.158 attempt. | Keep as process record. |
| `docs/pr/BUILD_PR_LEVEL_11_159_FIX_ACTIVE_SHARED_ASSET_TILE_RENDERER.md` | KEEP | Scope pivot from Workspace Manager to shared renderer lane. | Keep as process record. |
| `docs/pr/BUILD_PR_LEVEL_11_160_FIX_SHARED_SHELL_SVG_ASSET_BADGE_COMPATIBILITY.md` | KEEP | Source-of-truth scope for shared-shell compatibility attempt. | Keep as process record. |
| `docs/pr/BUILD_PR_LEVEL_11_161_WIRE_SVG_PAYLOAD_TO_SHARED_ASSET_BADGE.md` | KEEP | Source-of-truth scope for payload wiring attempt. | Keep as process record. |
| `docs/pr/PR_11_162.md` | KEEP | Dead-wiring/report-focused scope doc for 11.162. | Keep as process record. |
| `docs/pr/PR_11_163_FREEZE_BADGE_CHURN_AND_TRACE_HANDOFF.md` | KEEP | Freeze-and-trace scope doc for ownership stabilization. | Keep as process record. |
| `docs/pr/PR_11_164_DEAD_CODE_LEDGER_AND_REVERT_MAP.md` | KEEP | Current controlling spec for this recovery PR. | Keep. |

## Summary
- Confirmed primary investigate owner: `tools/shared/platformShell.js`.
- Confirmed immediate safe dead artifacts to revert: empty/placeholder/manifest-only report files.
- No runtime behavior was modified in this audit PR.