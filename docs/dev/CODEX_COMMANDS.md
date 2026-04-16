MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_17_52_DEBUG_OVERLAY_CYCLE_KEY_AND_SAMPLE_STACK_MAP as a small, testable PR.

Requirements:
- Remove Tab as the overlay-cycle key in the touched phase-17 samples.
- Introduce one consistent non-browser-reserved replacement key across the touched samples.
- Keep all touched debug panels bottom-right anchored.
- Enforce the exact sample-specific cycle maps:
  - 1708, 1710: UI Layer -> Mission Feed -> existing title ending in ADY -> Mini-Game Runtime
  - 1709, 1711: Movement Runtime -> Movement Lab HUD
  - 1712: UI Layer -> Mission Feed -> existing title ending in ADY -> Telemetry Overlay
  - 1713: UI Layer -> Mission Feed -> existing title ending in ADY -> Final Reference Runtime
- Keep the ADY-ending title as-is unless already incorrect for another reason.
- Update/add runtime tests so they verify the replacement key, reject Tab behavior, verify panel presence/order, and confirm bottom-right placement.

Constraints:
- Smallest scoped valid change only.
- Do not modify start_of_day folders.
- Do not do repo-wide scanning.
- Keep implementation one-pass executable.

Package the resulting repo-structured ZIP to:
<project folder>/tmp/BUILD_PR_LEVEL_17_52_DEBUG_OVERLAY_CYCLE_KEY_AND_SAMPLE_STACK_MAP.zip
