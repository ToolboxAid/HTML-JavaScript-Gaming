MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Implement rewind execution and deterministic replay in network_sample_c only.

- Use StateTimelineBuffer
- Use ReconciliationLayerAdapter outputs
- Restore frame, replay inputs forward
- Update timeline after replay

DO NOT:
- Modify engine core
- Create or modify documentation
- Expand beyond sample scope
