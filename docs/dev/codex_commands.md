MODEL: GPT-5.3-codex
REASONING: low

PR purpose:
Stabilize existing tools only. Do not add new features.

Priority:
1. Fix Vector Map Editor default selection behavior first.
2. Fix paint/fill and stroke controls.
3. Improve State Inspector JSON usability.
4. Remove silent fallback data.
5. Apply header polish follow-up.

Hard rules:
- Do not use silent fallback data.
- Do not auto-load hidden/default sample assets.
- Do not add safe fallback behavior that hides missing tool configuration.
- If required data or configuration is missing, show an actionable error message.
- Do not modify start_of_day folders.
- Do not modify sample games or unrelated engine runtime files.

Header follow-up:
- Keep fullscreen header single-line format:
  <Tool Name> — <Short Description>
- If tool.name or tool.shortDescription is missing, show an actionable configuration error.
- Add hard max-width / nowrap / overflow hidden / text-overflow ellipsis.
- Lock font size and line height.
- Add data-tool-id to header DOM.

Vector Map Editor:
- Make initial selection/mode explicit and visible.
- Do not silently select an object.
- Do not silently load default/sample data.
- Show empty state when no map/manifest is loaded.
- Confirm selection clears correctly.

Paint / stroke:
- Ensure fill/paint controls update selected editable objects.
- Ensure stroke controls update selected editable objects.
- Disable controls only when there is no valid selection.
- Disabled controls must explain why.

State Inspector:
- Format valid JSON.
- Show clear parse errors for invalid JSON.
- Show safe empty state for missing/empty state.
- Do not inject sample state.

Validation:
- Run node --check on changed JavaScript files.
- Manually verify the four target tools:
  - Vector Map Editor
  - Vector Asset Studio
  - Sprite Editor
  - State Inspector

Report:
- List changed files.
- List validation commands/results.
- Note any remaining issues without masking them.
