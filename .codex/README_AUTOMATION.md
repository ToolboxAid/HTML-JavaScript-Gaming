# Codex Automation Layout

Codex already auto-loads AGENTS.md from the repo root.

Use this folder for project-local Codex helpers:
- skills/ for reusable workflows that should load only when invoked
- optional project config later if needed

Recommended usage:
1. Keep AGENTS.md at repo root
2. Keep start_of_day lightweight
3. Use the repo-build skill when you want Codex to execute a BUILD with packaging
