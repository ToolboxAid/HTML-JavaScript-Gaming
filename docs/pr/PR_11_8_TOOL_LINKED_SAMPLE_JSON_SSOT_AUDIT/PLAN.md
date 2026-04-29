# PLAN_PR_11_8_TOOL_LINKED_SAMPLE_JSON_SSOT_AUDIT

## Purpose
Audit and enforce JSON source-of-truth for every sample that is tied to a tool, including visual/color data.

## Scope
- All samples that launch, reference, preview, or provide data to tools.
- Tool-linked sample JSON only.
- Verify 100% of tool/sample data comes from JSON:
  - asset entries
  - selected asset/tool state
  - colors
  - palettes
  - stroke/fill values
  - tile/vector/sprite config
  - import/export destination hints
  - preview/render config
- Remove or demote code-local canonical data where it duplicates JSON.
- Preserve no fallback/hidden/default-data rule.
- Do not modify start_of_day folders.

## Acceptance
- Every tool-linked sample has explicit JSON data for tool-visible state/data.
- No tool-linked sample depends on JS hardcoded canonical data for colors or other tool data.
- Color/palette/stroke/fill config is JSON-owned where visible to tools.
- Tools and sample previews consume the same JSON source.
- Empty states still work when explicit JSON is absent.
