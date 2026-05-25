# Tool Template V2 Batch Guardrail Contract

Batch operations process repeated work across real discovered inputs. A First-Class Tool V2 batch flow must be explicit, observable, and safe to resume or diagnose.

## Discovery Rules

- Discover real files and directories.
- Never assume numeric folder sequences.
- Missing discovered candidates are logged as `SKIP`, not `FAIL`, unless the missing item is the selected single input.
- Logs must identify the resolved input path or identifier for every item.

## Per-Item Logging

Every item must log exactly one terminal outcome through the tool logger:

- `OK`: item completed and wrote or updated the expected output.
- `WARN`: item completed with a recoverable warning.
- `FAIL`: item failed with an actionable error.
- `SKIP`: item was intentionally skipped.

Per-item logs must include the item identifier and the reason for `WARN`, `FAIL`, or `SKIP`.

## Failure Isolation

- One item failure must not stop the batch unless the failure is global.
- Global failures include missing required configuration, unavailable repo access, invalid destination root, or a cancelled run.
- Batch processors must keep processing remaining discovered items after item-level `FAIL` or `SKIP` outcomes.

## Summary Contract

Every batch run must finish with a summary that includes:

- `written`
- `failed`
- `skipped`
- `warnings`

The summary must match the per-item log outcomes.

## Stop/Cancel Contract

Long-running batches must support a stop or cancel pattern when applicable.

- Stop/cancel requests must prevent new items from starting.
- Already-running item work should finish or fail safely.
- Cancelled remaining items should be logged as `SKIP` or another clearly documented non-success outcome.
- The final summary must make cancellation visible.

## No Silent Fallback

Batch processors must not invent default inputs, substitute fallback targets, or claim success when a fallback or partial result occurred.
