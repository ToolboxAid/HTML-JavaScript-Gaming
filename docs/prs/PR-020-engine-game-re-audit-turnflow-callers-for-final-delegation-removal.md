# PR-020: engine/game re-audit turn-flow callers for final delegation removal

## Title

engine/game: re-audit turn-flow callers for final delegation removal

## Result

A safe final delegation removal is **not performed in this build package**.

Based on the available inspection context, there is still not enough confirmed local caller evidence to justify removing these compatibility methods from `engine/game/gameUtils.js`:

- `areTrackedPlayersOut`
- `findNextActivePlayer`
- `swapPlayer`

## Decision

- keep `GameUtils` turn-flow delegation in place for now
- do not remove compatibility methods without a confirmed local caller audit
- record the re-audit result as a docs-only decision

## Why

This avoids speculative removal and preserves behavior while keeping the repo ready for a future local, evidence-based cleanup PR.

## Next likely step

Perform a full local repo-wide search and classify any remaining callers as:
- production
- sample
- test
- dead/docs reference

Then either:
- remove delegation if no meaningful callers remain, or
- document the remaining callers and defer removal again
