# Full Automation Notes

This setup automates the repeated instruction load by splitting responsibility:

- AGENTS.md = auto-loaded durable repo guidance
- .codex/skills/repo-build/SKILL.md = reusable BUILD execution workflow loaded when invoked
- start_of_day/codex/CODEX_CORE.md = tiny daily reminder only
- CODEX_AUTO_COMMAND.md = minimal trigger command

Daily flow:
1. Load CODEX_CORE.md and EXECUTION_GATE.md
2. Run the minimal command from docs/dev/templates/CODEX_AUTO_COMMAND.md
3. Point Codex at PLAN_PR + BUILD_PR
4. Codex uses AGENTS.md and repo-build skill to stay on rails
