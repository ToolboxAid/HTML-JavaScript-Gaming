# Rollback Guardrails

## Guardrails
- Replay path must be deterministic
- Replay path must use recorded inputs, not live input sampling
- Timeline truncation must occur before repopulation
- Replay must restore from anchor snapshot, not current divergent state
- Buffer size limits must remain enforced after replay

## Failure Indicators
- Replay result differs across repeated identical runs
- Timeline grows without bound
- Debug panel reports replay success but timeline does not update
- Authoritative correction mutates state directly without replay
