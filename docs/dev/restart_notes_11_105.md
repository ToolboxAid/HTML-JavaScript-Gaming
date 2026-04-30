# Restart Notes — PR 11.105

Run this after PR 11.104 / PR 11.103 outputs are applied.

Primary goal:
- Do not lock schema yet.
- First remove sample/tool references that do not load real aligned input.

Key rule:
- If the sample cannot be used in the tool, remove the tool reference.

Expected outcome:
- Tool lists become honest.
- No default-only tool cards.
- No placeholder/fallback data.
- Canonical names are stable before schema lock.
