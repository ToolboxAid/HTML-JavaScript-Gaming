# Daily Startup (One-Shot)

## ChatGPT Project
Start a NEW chat in your dedicated Project and paste:

Use docs/dev/PROJECT_INSTRUCTIONS.md as system instructions.

Run full workflow for <PLAN_PR_NAME>

## What ChatGPT should return
- PLAN validation result
- compact BUILD_PR
- Codex command
- downloadable repo-structured ZIP

## Codex
Run the generated command. Codex will rely on:
- AGENTS.md
- .codex/skills/repo-build/SKILL.md

## Why this works
Projects keep the workflow context together, which is useful for repeated long-running work. AGENTS.md is auto-read by Codex before it starts, and skills load on demand rather than every session.
