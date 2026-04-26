# Codex Commands — BUILD_PR_LEVEL_20_26_REPAIR_WORKSPACE_PAGER_BUTTON_EVENTS

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.

Execute BUILD_PR_LEVEL_20_26_REPAIR_WORKSPACE_PAGER_BUTTON_EVENTS.

Current UAT:
- Pager now shows: [PREV]Palette Browser / Manager[NEXT]
- This means tool label resolution works.
- Buttons do not function.

Goal:
Fix only the Workspace Manager pager button events.

Required:
- Bind Prev/Next handlers to the actual rendered pager buttons inside mounted content.
- Ensure handlers are attached after pager render or through delegated handling from stable parent.
- Do not bind to removed/stale top-shell pager nodes.
- Avoid duplicate event listeners on repeated render.
- NEXT updates selected tool, updates label, and remounts/activates selected tool.
- PREV updates selected tool, updates label, and remounts/activates selected tool.
- Game launch must work without tool query:
  tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game
- tool= may initialize selection if present, but must not be required.

Forbidden:
- changing samples
- changing game launch labels
- restoring gameId || game
- requiring tool=
- duplicate pager
- moving pager back to top host shell
- new header/banner
- broad Workspace Manager refactor
- start_of_day changes

Likely files:
- tools/Workspace Manager/main.js
- maybe tools/shared/platformShell.js only if pager is rendered/bound there

Validation:
Create docs/dev/reports/workspace_pager_button_events_validation.md with:
- changed files
- root cause of non-functioning buttons
- proof pager label still resolves
- proof NEXT changes selected tool label
- proof NEXT remounts/activates selected tool
- proof PREV changes selected tool label
- proof PREV remounts/activates selected tool
- proof game launch works without tool=
- proof tool= is not required
- proof no duplicate event listeners on repeated render
- proof gameId || game fallback not restored
- proof samples remain untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_26_REPAIR_WORKSPACE_PAGER_BUTTON_EVENTS.zip
```
