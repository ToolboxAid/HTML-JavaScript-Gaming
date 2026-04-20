# BUILD_PR_HEADER_INTRO_OVERLAY_COLLAPSED_HEADER_RESTYLE

## Purpose
Restyle the shared header/intro presentation so the Header and Intro sit on top of the hero image, while preserving the existing style-system architecture and excluding `page-shell` from this change.

## Scope
- Move the shared Header and Intro visual block on top of the image
- Remove the background behind the overlaid Header and Intro block
- Set overlay foreground color to `#ed9700`
- When collapsed, set header background color to `#7a00df`
- Remove corner rounding from the header container
- Exclude `page-shell` selectors and layout rules from this PR

## Non-Goals
- No `page-shell` edits
- No tool-shell changes
- No navigation/content restructuring
- No new JS behavior unless a tiny class/state hook is required to apply the collapsed style already driven by existing collapse behavior
- No repo-wide style cleanup beyond the selectors directly responsible for this slice

## Implementation Targets
- Shared theme CSS under `src/engine/theme/`
- Shared header/intro markup hooks only if required to support the overlay styling cleanly
- Existing collapse state hook only if already present; otherwise use the smallest possible additive hook

## Required Visual Outcome
1. The Header and Intro render visually on top of the image
2. The overlaid Header and Intro have no background fill
3. Overlay foreground/text/accent color uses `#ed9700`
4. In collapsed state, the header background becomes `#7a00df`
5. Header corners are square (no border radius)
6. `page-shell` remains untouched

## Constraints
- No embedded `<style>` in HTML
- No inline `style=""` in HTML
- No JS-generated style strings
- Keep the change additive and page-by-page within the shared theme system
- Preserve existing header/image behavior unless required by the overlay treatment

## Suggested Files To Touch
- `src/engine/theme/main.css`
- `src/engine/theme/header.css`
- Any one shared intro/header partial or minimal loader hook only if necessary
- Roadmap file: status-only update if there is an existing matching style item for this work

## Acceptance Criteria
- Header and Intro overlay the image on the targeted shared entry pages
- Overlay background is transparent/none
- Overlay foreground color is `#ed9700`
- Collapsed header background is `#7a00df`
- Header border radius is removed
- No `page-shell` selectors are modified
- No layout regressions on the targeted pages
- No horizontal overflow introduced
- Existing collapse behavior still works

## UAT Checklist
- Open each targeted shared entry page and verify Header + Intro are drawn over the image
- Verify there is no background panel behind the overlaid content
- Verify overlay foreground elements read as `#ed9700`
- Collapse the header/intro region and verify collapsed header background is `#7a00df`
- Verify header has square corners in both expanded and collapsed states
- Verify pages using `page-shell` do not change because `page-shell` was excluded
- Verify no console errors

## Codex Notes
- Keep this to one PR purpose only
- Use the smallest selector changes that achieve the requested visual result
- Do not widen this into a broader theme cleanup
- If a selector currently couples header/intro overlay behavior to `page-shell`, decouple only the minimum necessary portion without changing `page-shell` rules themselves
