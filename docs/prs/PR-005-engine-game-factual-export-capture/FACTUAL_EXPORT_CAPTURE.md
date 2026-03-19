PR-005 — factual export capture

### Purpose

This document records the actual current export surface of `engine/game` based on the repo.

### Recording Format

Use one row per captured export with these fields:

- export name
- defining file
- re-export file
- surface type
- notes

#### Surface type values

- direct export
- re-export

### Capture Table

| Export Name | Defining File | Re-export File | Surface Type | Notes |
| --- | --- | --- | --- | --- |
| To be captured from the repo in a later factual pass | To be captured from the repo in a later factual pass | Leave blank if not re-exported | direct export / re-export | Facts only |

### Capture Rules

- record actual exports exactly as exposed today
- use the repo as the source of truth
- do not reinterpret behavior
- do not infer removals
- do not change compatibility surfaces in this PR
