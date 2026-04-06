MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Implement multi-entity timeline and selective rewind support in network_sample_c only.

- Introduce per-entity timeline buffers
- Update reconciliation to operate per entity
- Implement selective rewind execution
- Extend debug visualization for multiple entities

DO NOT:
- Modify engine core APIs
- Create or edit documentation
- Expand beyond sample scope
