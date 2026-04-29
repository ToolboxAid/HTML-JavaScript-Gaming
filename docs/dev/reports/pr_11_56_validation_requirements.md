# PR 11.56 Validation Requirements

Codex must include evidence for:

- before audit counts
- selected JSON files
- direct JS/reference checks for each file
- metadata/index stale-reference cleanup when applicable
- after audit counts
- confirmation that NO/missing-reference count decreased
- targeted test notes
- full suite skipped reason

If count does not decrease, Codex must fail the PR and explain which reference source is still keeping the item counted.
