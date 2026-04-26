# Codex Commands — BUILD_PR_LEVEL_20_27_FORCE_DELEGATED_WORKSPACE_PAGER_EVENTS

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.

Execute BUILD_PR_LEVEL_20_27_FORCE_DELEGATED_WORKSPACE_PAGER_EVENTS.

Current UAT:
- Pager renders.
- Label resolves.
- Buttons still do not work.

Goal:
Force pager buttons to work using delegated click handling from a stable parent.

Required:
1. Find the live pager render path.
2. Ensure buttons have:
   - data-tool-host-prev
   - data-tool-host-next
3. Bind one delegated click handler from a stable parent that survives re-render:
   - preferably data-tool-host-mount-container or tool-host-workspace.
4. Handler must detect clicks via closest("[data-tool-host-prev]") and closest("[data-tool-host-next]") or equivalent.
5. Handler must update selected tool from the authoritative available tool list/current index.
6. Handler must update the pager label.
7. Handler must remount/activate selected tool content.
8. Add console diagnostics showing PREV/NEXT handler fired.
9. If state/tool list is missing, render visible diagnostic instead of silent no-op.
10. Avoid duplicate listeners on repeated render.

Forbidden:
- moving pager
- duplicate pager
- relying on button text
- requiring tool=
- restoring gameId || game
- changing samples
- broad Workspace Manager refactor
- start_of_day changes

Validation:
Create docs/dev/reports/workspace_pager_delegated_events_validation.md with:
- changed files
- explanation why previous binding failed
- stable parent used for delegated listener
- proof data-tool-host-prev and data-tool-host-next exist
- proof delegated handler is bound once
- proof repeated render does not duplicate listener
- proof NEXT handler fires
- proof NEXT changes label and mounted tool
- proof PREV handler fires
- proof PREV changes label and mounted tool
- proof no click path depends on button text
- proof game launch works without tool=
- proof gameId || game fallback not restored
- proof samples remain untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_27_FORCE_DELEGATED_WORKSPACE_PAGER_EVENTS.zip
```
