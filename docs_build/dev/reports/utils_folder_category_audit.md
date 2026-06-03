# Utils Folder Category Audit

Utility files under src/engine/utils: 0

## Folder-Category Mismatches
- none

## Remaining Literal src/engine/utils References
Total literal references found: 11
- docs_build/dev/codex_commands.md:11 :: Inspect src/shared/utils/** and any remaining src/engine/utils/**.
- docs_build/dev/codex_commands.md:23 :: 4. every remaining literal reference to src/engine/utils/ and /src/engine/utils/
- docs_build/pr/BUILD_PR_11_80_DEAD_UTILS_AUDIT.md:40 :: Exit non-zero if any stale `src/engine/utils/` or `/src/engine/utils/` references remain.
- docs_build/pr/PLAN_PR_11_80_DEAD_UTILS_AUDIT.md:8 :: - Scan `src/shared/utils/**` and any remaining `src/engine/utils/**` utility files.
- docs_build/pr/PLAN_PR_11_80_DEAD_UTILS_AUDIT.md:10 :: - Detect stale references to `src/engine/utils/` and `/src/engine/utils/`.
- docs_build/pr/PLAN_PR_11_80_DEAD_UTILS_AUDIT.md:24 :: - `-Ci` exits non-zero only when stale `src/engine/utils/` references remain, not merely because dead candidates exist.
- docs_build/pr/PR_11_81_UTILS_AUDIT_EXPANSION.md:16 :: - any remaining `src/engine/utils/**`
- docs_build/pr/PR_11_81_UTILS_AUDIT_EXPANSION.md:68 :: - Remaining `src/engine/utils/` references are listed.
- scripts/PS/audit-dead-utils.ps1:108 :: "/src/engine/utils/$baseName",
- scripts/PS/audit-dead-utils.ps1:109 :: "/src/engine/utils/$moduleName"
- scripts/PS/audit-dead-utils.ps1:152 :: $stalePatterns = @('src/engine/utils/', '/src/engine/utils/')