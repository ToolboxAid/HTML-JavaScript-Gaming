PR-009 — caller search rules

### Caller Categories

Search for references in:
- games
- samples
- engine modules
- other repo callers

### What To Record

For each verified reference, record:
- export name
- caller file
- caller category
- reference type
- short factual note

### Reference Types

- direct import
- namespace import usage
- indirect visible reference

### Quality Rules

Prefer direct evidence from repo imports or visible symbol usage.

Keep separate:
- verified direct caller evidence
- broader architectural observations

Avoid:
- behavior speculation
- compatibility narrowing recommendations
- removal proposals in this PR
