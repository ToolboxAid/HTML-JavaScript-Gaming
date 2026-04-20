MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_SAMPLES_METADATA_TAG_NORMALIZATION_AND_FILTER_BAR_UX

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_SAMPLES_METADATA_TAG_NORMALIZATION_AND_FILTER_BAR_UX.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only if execution-backed status changes are earned
- no embedded <style> blocks
- no inline style=""
- no JS-generated styling
- keep scope limited to /samples/index.html and directly related sample metadata/rendering/filter dependencies
- preserve the current accepted page shell and shared header/body consistency

Required work:
1. Normalize sample metadata so tags are real descriptive tags instead of duplicates of class values.
2. Keep/assign a clear class value for each sample.
3. If classes are shown for each sample, show them outside the description text.
4. Do NOT append classes/tags/phase metadata into the sample description body.
5. Ensure class filter values are sorted alphabetically and contain no duplicates.
6. Ensure tag filter values are sorted alphabetically and contain no duplicates.
7. Put search on the same row as Phase, Class, and Tag.
8. Use explicit `Pinned` / `Unpinned` text values instead of a red/green icon treatment.
9. Preserve preview image launch behavior and hover zoom.
10. Keep filtering and pinning behavior working.
11. Keep the change narrow, testable, and behavior-focused rather than redesigning the page.
