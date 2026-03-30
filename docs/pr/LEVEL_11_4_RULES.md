# LEVEL_11_4_RULES

Codex MUST:
- Add feature gate for score
- Implement ONE authoritative transition
- Prevent mutation outside transition
- Keep selectors pure
- Keep consumer read-only

Codex MUST NOT:
- Modify engine/
- Add additional slices
- Add multiple consumers
- Refactor unrelated systems
