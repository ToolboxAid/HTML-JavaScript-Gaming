# Pre-Commit Test Checklist

## Games / samples to test
- multi-player sample with player switching
- any life-based game-over sample
- tracked-player scenarios if available

## Targeted checks
- same return shape from swapPlayer
- no mutation of input lives array
- correct next-player selection
- correct tracked-player-only game-over behavior
- player-selection behavior remains unchanged
