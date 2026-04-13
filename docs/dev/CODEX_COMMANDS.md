MODEL: GPT-5.4
REASONING: low

COMMAND:
Implement BUILD_PR_LEVEL_6_4_RUNTIME_VALIDATION_PLUS_HARNESS_FIX.

Change:
In tests/runtime/LaunchSmokeAllEntries.test.mjs

Replace:
^phase\d{2}$

With:
^phase-?\d{2}$

Do not modify anything else.

Return ZIP:
<project folder>/tmp/BUILD_PR_LEVEL_6_4_RUNTIME_VALIDATION_PLUS_HARNESS_FIX.zip
