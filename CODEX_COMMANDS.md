Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-REPLAY-SYSTEM-BIG-PACKAGE-ONE-PASS. Build a minimal replay MVP that records deterministic input/event data and replays it to reproduce the same outcome. Keep the generic replay core narrow and reusable, and integrate it into games/GravityWell/ first as the proof target. Add focused tests for recording integrity, playback correctness, and same-input same-outcome behavior, using explicit tolerance only where necessary. Do not perform a broad engine redesign, expand gameplay, or build a full editor/tool suite.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that a narrow replay MVP exists, Gravity Well can record and replay deterministically, tests cover replay correctness, and no broad engine redesign or gameplay expansion was introduced.
