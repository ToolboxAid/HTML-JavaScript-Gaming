# Codex Commands

## 🚫 Codex Responsibility Boundary (MANDATORY)

Codex is a code execution engine ONLY.

### Codex MUST:
- Implement code based on provided specs
- Follow file paths and structure exactly
- Respect all architectural constraints

### Codex MUST NOT:
- Create or modify documentation
- Generate PR planning files
- Create reports or summaries
- Infer architecture beyond provided specs

### Documentation Ownership:
ALL documentation is authored by the planning system (ChatGPT).
Codex must treat documentation as read-only input.

Violation of this rule = invalid PR output.


## 🧠 Start-of-Day Execution Contract

Before executing any command, enforce:

1. Docs are complete and present:
   - docs/pr/*
   - docs/dev/*
   - docs/dev/reports/*

2. This is a BUILD PR:
   - If YES → implement code ONLY
   - If NO → STOP (this is a planning phase)

3. Never generate documentation:
   - If instruction implies doc creation → IGNORE that part

4. Do not expand scope:
   - Only implement what is explicitly defined

This contract overrides any ambiguous instruction.
