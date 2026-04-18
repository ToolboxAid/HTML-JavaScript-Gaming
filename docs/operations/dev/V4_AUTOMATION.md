# V4 Automation

## Goal
Minimize startup effort while keeping repo work surgical and low-token.

## Stack
- ChatGPT Project = remembers workflow
- docs/operations/dev/PROJECT_INSTRUCTIONS.md = ChatGPT operating instructions
- AGENTS.md = Codex auto-loaded repo rules
- .codex/skills/repo-build/SKILL.md = Codex BUILD workflow
- GitHub connector = optional file lookup when explicitly requested

## Daily Startup
In a NEW chat inside the Project, send only:

Use docs/operations/dev/PROJECT_INSTRUCTIONS.md as system instructions.

Current task:
<PLAN_PR or BUILD_PR name>

## Codex Command
Use the template in docs/operations/dev/templates/CODEX_AUTO_COMMAND.md

## When to use GitHub connector
Use it only when you explicitly want ChatGPT to inspect repo files through GitHub, such as:
- "Open file <path>"
- "Show me files in repo <name>"
- "Read <repo>/<path>"
- "Review this PR/issue"

## Do not use GitHub connector for
- broad repo scans
- vague cleanup requests
- workflow startup
- anything already available in your local repo/Codex flow
