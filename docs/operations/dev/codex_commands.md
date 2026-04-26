# Codex Commands — BUILD_PR_LEVEL_20_10_REMOVE_LEGACY_LAUNCH_FALLBACK_RESIDUE

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md second.
Read docs/dev/reports/tool_launch_ssot_routing_validation.md third.
Read docs/dev/reports/tool_launch_ssot_data_layer_validation.md fourth.

Execute BUILD_PR_LEVEL_20_10_REMOVE_LEGACY_LAUNCH_FALLBACK_RESIDUE.

Goal:
Remove remaining legacy launch routing residue and default/fallback behavior from the touched SSoT launch flow.

If either validation report is missing:
- create docs/dev/reports/legacy_launch_fallback_residue_validation.md
- mark status BLOCKED
- explain missing prerequisite
- stop without implementation changes

Required behavior to preserve:
- samples use label: Open <tool>
- samples launch tools through SSoT target paths: tools/<tool>/index.html
- games use label: Open with Workspace Manager
- games launch Workspace Manager through SSoT target path: tools/Workspace Manager/index.html
- external launches from samples/games clear launch memory before loading
- invalid or missing SSoT target/context fails visibly

Remove only in touched launch flow:
- duplicated hardcoded launch paths
- default tool/workspace selections
- fallback routes
- stale memory reuse
- first-item selection
- label-text guessing
- DOM-order guessing
- compatibility branches that bypass SSoT

Hard constraints:
- smallest valid change
- no unrelated cleanup
- no repo-wide rewrite
- no start_of_day changes
- no roadmap text rewrite except status markers
- no anti-patterns listed in docs/dev/codex_rules.md
- no second source of truth
- do not alter required label meanings

Validation:
Create docs/dev/reports/legacy_launch_fallback_residue_validation.md with:
- changed files
- exact residue removed
- proof sample actions still say Open <tool>
- proof game actions still say Open with Workspace Manager
- proof sample target paths come from SSoT
- proof game Workspace Manager target path comes from SSoT
- proof external launch memory clear remains intact
- proof missing target/context does not fallback
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_10_REMOVE_LEGACY_LAUNCH_FALLBACK_RESIDUE.zip
```
