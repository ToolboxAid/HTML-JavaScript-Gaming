PR-004 — source mapping rules

### Mapping Rules

For each `engine/game` export, record:

- the file that defines it, if direct
- the file that re-exports it, if re-exported
- whether it appears to exist for compatibility

### Notes Rules

Keep notes factual and brief.

Good note examples:
- direct export from module entry
- re-exported from compatibility barrel
- compatibility wrapper still exposed

Avoid:
- behavior speculation
- migration decisions
- removal recommendations in this PR
