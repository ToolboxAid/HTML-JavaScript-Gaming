# Deterministic Replay Rules

- No Math.random() in replay path
- No time-based deltas
- All state derived from inputs + previous state

Violation breaks rewind correctness
