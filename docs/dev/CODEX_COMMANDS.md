MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
1. Run:
   node tools/dev/checkSharedExtractionGuard.mjs

2. Capture output differences.

3. Locate baseline file (likely in tools/dev or reports).

4. Determine:
   - Are new shared entries valid? If YES → update baseline
   - If NO → fix classification logic

5. Apply smallest change:
   - update baseline JSON OR
   - adjust guard filters

6. Run:
   npm test

7. Confirm:
   pretest passes (no baseline drift)

8. Package:
   <project folder>/tmp/BUILD_PR_LEVEL_19_8_FIX_SHARED_EXTRACTION_GUARD_BASELINE.zip

CONSTRAINTS:
- Do not modify unrelated systems
- Do not remove guard
- Preserve intent of guard
