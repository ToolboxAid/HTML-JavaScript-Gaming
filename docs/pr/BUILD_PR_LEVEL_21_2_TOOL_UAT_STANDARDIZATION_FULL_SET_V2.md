# BUILD_PR_LEVEL_21_2_TOOL_UAT_STANDARDIZATION_FULL_SET_V2

## Purpose
Normalize the full tools documentation set to UAT, not testing.

## Scope
- create `docs/tools/<tool-name>/uat.md` for all primary tools
- add Tools Index / Registry UAT coverage
- standardize UAT terminology
- explicitly remove old `docs/tools/testing/` path from the standard

## Roadmap intent
This PR may complete:
- create full testing documentation for each tool
- define manual test cases per tool
- standardize validation reports under docs/dev/reports

using UAT naming and structure.

## Hard rules
- use `uat.md`, not `testing.md`
- use `docs/tools/<tool-name>/uat.md`, not `docs/tools/testing/`
- preserve unrelated working-tree changes
