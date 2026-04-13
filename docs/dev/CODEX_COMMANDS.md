MODEL: GPT-5.4
REASONING: low

COMMAND:
Implement BUILD_PR_LEVEL_6_5_SAMPLE_INDEX_NORMALIZATION.

Scope:
- samples/index.html only

Steps:
1. Update paths to phase-XX structure.
2. Sort entries by phase then id.
3. Remove invalid/broken links.

Validation:
- links resolve
- ordering correct

Return ZIP:
<project folder>/tmp/BUILD_PR_LEVEL_6_5_SAMPLE_INDEX_NORMALIZATION.zip
