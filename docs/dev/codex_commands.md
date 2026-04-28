# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_10_7_UNIFIED_TOOL_UX_CONTRACT

- Implement shared layout zones across all tools
- Enforce lifecycle states
- Add first-item auto-selection
- Enforce control enable/disable rules
- Add explicit empty-state UI (no fallback data)
- Ensure tools behave correctly inside workspace (no reset, no auto-close)
- Do not modify data layer
- Do not refactor unrelated code
