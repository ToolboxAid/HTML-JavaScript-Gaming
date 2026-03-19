PR-019 — allowed alignment changes

### Allowed Change Types

The first code PR may include only runtime-neutral alignment changes such as:

- non-breaking intent comments near exports
- posture comments that reflect documented compatibility status
- preferred-path comments that reinforce `GameBase` direction without changing code flow
- tiny runtime-neutral descriptive markers if they do not affect build or execution

### Example Allowed Pattern

Acceptable examples include:
- comment: this export is compatibility-retained for current callers
- comment: preferred public direction centers on GameBase
- comment: future migration planning may affect documentation posture, not current runtime support

### Alignment Rule

If a change cannot be removed without changing runtime behavior, it is out of scope for the first code PR.
