# Frame History Specification

## Purpose
Store recent frames for rewind and replay.

## Requirements
- Ring buffer (fixed size)
- Store:
  - input
  - predicted state
  - timestamp

## Notes
Keep lightweight and sample-scoped
