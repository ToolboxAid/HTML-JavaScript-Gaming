MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Execute PLAN + BUILD + APPLY for DEBUG_UX_FINAL_POLISH.

IN SCOPE:
- finalize debug ON/OFF badge behavior
- finalize default preset auto-load behavior
- finalize `Open Debug Panel` consistency
- finalize inline mini help consistency
- evaluate remembered debug state
- evaluate one-click demo mode

TARGET SAMPLES:
- Asteroids
- Breakout

RULES:
- sample-level integration only
- preserve production-safe defaults
- do not modify BIG_PICTURE_ROADMAP.md
- if PRODUCTIZATION_ROADMAP.md is updated, use bracket-only edits only
- no Track G or Track H work

OUTPUT:
Create:
<project folder>/tmp/PR_DEBUG_UX_FINAL_POLISH_FULL_bundle.zip