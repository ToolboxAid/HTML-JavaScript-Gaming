# Rewind Execution Specification

## Steps
1. Identify target frame from rewind-prep
2. Restore predicted state at that frame
3. Reapply stored inputs forward
4. Recompute predicted states
5. Replace future timeline with replayed frames

## Requirements
- Deterministic replay
- No random or time-based drift
