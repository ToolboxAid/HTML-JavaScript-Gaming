# Codex Start-of-Day

This folder contains the persistent operating instructions for Codex during repo work.

## Purpose
Keep Codex focused on:
- code implementation only
- following the approved BUILD doc exactly
- writing the smallest scoped change
- packaging a repo-structured delta ZIP
- avoiding roadmap corruption

## Directory Protection Rule
Codex may not create, modify, rename, delete, replace, or add any file in:
- `docs/dev/start_of_day/chatGPT/`
- `docs/dev/start_of_day/codex/`

unless the user explicitly asks for a change to those directories.

## Windows Execution Preference
On Windows machines:
- prefer Node.js or Python for file operations, renames, path normalization, and ZIP-related scripting
- avoid PowerShell for path-building or rename-heavy work unless PowerShell is explicitly required by the BUILD doc
- when PowerShell is required, follow the PowerShell Safety Rules in `RULES.md`
