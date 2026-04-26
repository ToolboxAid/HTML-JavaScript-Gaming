# Codex Commands — BUILD_PR_LEVEL_20_12_UAT_VALIDATE_AND_LOCK_RECOVERY_GATE

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md second.
Read existing Phase 20 validation reports:
- docs/dev/reports/tool_launch_ssot_routing_validation.md
- docs/dev/reports/tool_launch_ssot_data_layer_validation.md
- docs/dev/reports/legacy_launch_fallback_residue_validation.md

Execute BUILD_PR_LEVEL_20_12_UAT_VALIDATE_AND_LOCK_RECOVERY_GATE.

Goal:
Validate and lock the Phase 20 recovery gate.

Do not implement new runtime behavior.
Do not perform broad cleanup.
Do not change start_of_day.
Do not rewrite roadmap text.

Validate:
1. Samples
   - actions labeled Open <tool>
   - targets come from SSoT
   - targets resolve to tools/<tool>/index.html
   - external launch memory is cleared
   - missing/invalid context fails visibly
   - no fallback/default behavior

2. Games
   - actions labeled Open with Workspace Manager
   - target comes from SSoT
   - target resolves to tools/Workspace Manager/index.html
   - external launch memory is cleared
   - missing/invalid context fails visibly
   - no fallback/default behavior

3. Workspace Manager UAT
   - games/index.html -> Open with Workspace Manager -> tools/Workspace Manager/index.html
   - memory cleared
   - explicit context loaded
   - no fallback/default behavior

4. Codex rules recheck
   - no alias variables
   - no pass-through variables
   - no duplicate launch state
   - no duplicated launch paths
   - no silent redirects
   - no stale memory reuse
   - no label-text or DOM-order guessing

Create:
- docs/dev/reports/phase20_recovery_uat_validation.md
- docs/dev/reports/phase20_recovery_gate_decision.md
- docs/dev/reports/phase20_codex_rules_recheck.md

Gate decision must be exactly one:
- PASS - recovery gate complete; normal roadmap may resume
- BLOCKED - recovery gate remains open

If PASS:
Update docs/dev/roadmaps/MASTER_ROADMAP_RECOVERY.md status markers only:
- anti-pattern drift -> [x]
- SSoT tool launch -> [x]
- external launch memory reset -> [x]
- Workspace Manager games/index.html validation -> [x]
- codex rule enforcement recheck -> [x]
- normal roadmap progression -> [x]

If BLOCKED:
Do not update those markers to [x].
List exact blocker, file path, failing UAT path, and next required BUILD_PR name.

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_12_UAT_VALIDATE_AND_LOCK_RECOVERY_GATE.zip
```
