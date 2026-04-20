# BUILD_PR_STYLE_INDEX_HEADER_AND_BODY_CONSISTENCY_FIX

## Purpose
Fix the inconsistency where `tools/index.html` correctly shows the full-width stretched header and correct page-body colors, but `index.html`, `games/index.html`, and `samples/index.html` do not.

## Single PR Purpose
Make the four main entry pages render the shared header and body theme consistently.

## Confirmed Symptom
- `tools/index.html` is the current good baseline.
- `index.html`, `games/index.html`, and `samples/index.html` do not match it for:
  - full-width header stretch behavior
  - page body colors / shared theme rendering

## Required Fix Direction
1. Treat `tools/index.html` as the visual baseline for:
   - shared header stretch behavior
   - shared body/theme color behavior
2. Audit the differences between:
   - `/tools/index.html`
   - `/index.html`
   - `/games/index.html`
   - `/samples/index.html`
3. Fix the three non-matching pages so they render consistently with the tools page.
4. Keep the change narrow and limited to the main entry pages only.

## Required Rules
- no embedded `<style>` blocks
- no inline `style=""`
- no JS-generated styling
- do not redesign the pages
- do not change header structure unless required for consistency
- prefer fixing shared CSS imports, shared body classes, and shared shell/theme usage
- preserve the working `tools/index.html` behavior unless a shared fix requires an equivalent adjustment

## Likely Root Causes To Check
- missing or different shared CSS imports
- different body class names
- different wrapper/container structure around the shared header
- header constrained by a centered container on the non-matching pages
- missing theme/layout class on the body or page shell
- inconsistent use of shared header mount point or shared page shell markup

## Acceptance
- `/index.html` matches the full-width header behavior of `/tools/index.html`
- `/games/index.html` matches the full-width header behavior of `/tools/index.html`
- `/samples/index.html` matches the full-width header behavior of `/tools/index.html`
- the three pages also match the body/theme color behavior of `/tools/index.html`
- no regressions to the working tools page
- change is visually testable
