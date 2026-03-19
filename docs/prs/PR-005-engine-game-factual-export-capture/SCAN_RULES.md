PR-005 — scan rules

### Scan Rules

For each `engine/game` export, record:

- the export name exactly as exposed
- the file that defines it
- the file that re-exports it, if applicable
- whether the surface is direct export or re-export
- whether a compatibility note is explicitly visible from repo structure

### Notes Rules

Keep notes factual and brief.

Good note examples:
- direct export from module entry
- re-exported through barrel
- compatibility wrapper visibly re-exported

Avoid:
- behavior speculation
- architecture decisions
- removal recommendations in this PR
