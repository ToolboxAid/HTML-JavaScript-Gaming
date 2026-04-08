# BUILD_PR_SHARED_EXTRACTION_02_EXACT_HELPER_MOVE

Purpose: Move duplicate helpers into src/shared using ONLY the target map.

Source of Truth:
PLAN_PR_SHARED_EXTRACTION_02_TARGET_MAP

Rules:
- DO NOT scan repo
- ONLY use listed files
- NO API changes
- NO new helpers

Instructions:
- Move helpers exactly as defined in target map
- Update imports only

Acceptance:
- No duplicates remain
- Imports valid
- Build passes
