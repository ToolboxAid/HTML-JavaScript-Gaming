# PR-019: engine/game migrate turn-flow callers off GameUtils

## Title

engine/game: audit remaining turn-flow callers and keep GameUtils delegation in place

## Result

No internal production callers to `GameUtils.areTrackedPlayersOut(...)`,
`GameUtils.findNextActivePlayer(...)`, or `GameUtils.swapPlayer(...)` were
identified in the available repo inspection for this build step.

Because there was no safe, confirmed internal caller set to migrate, this PR is
a docs-only/no-op migration record rather than a speculative code rewrite.

## Decision

- keep `GameUtils` turn-flow delegation in place for now
- do not make production import swaps without confirmed caller evidence
- record the audit result
- defer actual delegation removal until callers are confirmed or a broader audit is available

## Scope

Docs/support only.

No production or test files changed in this package.

## Why

This keeps the repo safe and avoids inventing migrations that cannot be justified
from the currently inspected repository state.

## Next likely step

Re-audit remaining repo callers with a more complete local search, then:
- remove `GameUtils` turn-flow delegation if unused, or
- migrate any confirmed callers directly to `GameTurnFlowUtils`
