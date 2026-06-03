# PLAN_PR_11_9_STANDALONE_SAMPLE_TOOL_JSON_DIRECT_LOAD_AUDIT

## Purpose
Audit and fix sample-to-standalone-tool data flow so tool-linked samples load 100% of tool-visible data directly from JSON.

## Problem
Samples use standalone tools, not samples-to-workspace as the primary validation path. Sample 1208 shows signs of incorrect ownership:
- duplicated JSON and JS data modules
- scene references tool JSON paths and extracts embedded documents
- data may be reference-driven instead of directly JSON-owned/loaded
- color/style/tool-visible config must also be JSON-owned

## Scope
- Standalone sample tool launch path only.
- All samples with standalone tool JSON payloads.
- Focus first on sample 1208, then apply same rule to all tool-linked samples.
- Ensure standalone tools consume the sample JSON payload directly.
- Remove/demote duplicate JS data modules when they mirror JSON.
- Include color/palette/style config in JSON SSoT validation.
- Do not modify start_of_day folders.

## Acceptance
- Sample 1208 standalone tool data is loaded directly from JSON, not mirrored JS modules.
- Any duplicate JS data modules that mirror JSON are removed or demoted to non-canonical runtime helpers.
- Standalone tool launch consumes explicit JSON payloads directly.
- All tool-visible data, including color/palette/fill/stroke/style config, is JSON-owned.
- Report lists all tool-linked samples checked and any fixes applied.
