# BUILD_PR_ENGINE_THEME_FINAL_PLATFORM_INTEGRATION

## Purpose
Finalize the active tools platform in the fewest possible remaining steps by applying the shared engine theme to all first-class tools and closing the remaining platform-surface integration gaps in one combined build PR.

## Scope
In scope:
- Make the engine theme the required visual system for all active tools under `tools/`
- Standardize shared shell/frame/navigation/header/footer behavior across active tools
- Standardize shared tokens for color, spacing, typography, borders, shadows, focus, buttons, panels, dialogs, tabs, form controls, and status messaging
- Align tool landing/index surfaces to the same engine-themed platform shell
- Ensure active tools render consistently while preserving each tool's own workspace behavior
- Ensure legacy `SpritEditor_old_keep` is excluded from active themed tool navigation unless explicitly opened by direct path
- Fix pathing/imports/assets required to support the shared engine theme across tools
- Perform one-pass validation for tool loading, theme application, and broken-reference checks

Out of scope:
- New editor features unrelated to shared platform/theme integration
- Engine runtime feature changes unrelated to theme/surface integration
- Deleting legacy tools
- Rewriting tool-specific domain logic unless required for shell/theme adoption

## Required Target State
Active first-class tools:
- `tools/Vector Map Editor/`
- `tools/Vector Asset Studio/`
- `tools/Tile Map Editor/`
- `tools/Parallax Editor/`

Legacy preserved but excluded from active platform surface:
- `tools/SpritEditor_old_keep/`

All active tools must:
- use the engine theme
- use the same platform shell
- use the same shared design tokens/components where appropriate
- appear as one coherent product family

## Engine Theme Rule (mandatory)
All active tools must adopt the engine theme as the single source of truth for visual styling.

Codex must:
- identify the current engine theme source(s)
- normalize them into a reusable shared theme contract if needed
- apply that contract to all active tools
- remove duplicated per-tool visual drift where safe
- preserve tool-specific layout/workspace needs while keeping the shared theme intact

Minimum theme contract should cover:
- app background / panel background / workspace background
- primary / secondary / accent / muted colors
- typography scale
- spacing scale
- borders / radii
- elevation / shadows
- button/input/tab/menu styling
- selected/hover/focus/disabled states
- status colors/messages
- light/dark behavior only if already supported by engine theme; do not invent a new mode system unless already present

## Implementation Plan (fewest remaining steps)
Use a single combined build PR with these execution phases:

### Phase 1 — Shared Theme Extraction/Normalization
- Locate engine theme assets/tokens/styles/components already present in repo
- Create or refine a shared theme module usable by all active tools
- Define a stable public contract for tool consumption
- Avoid duplicating theme values inside each tool

### Phase 2 — Active Tool Adoption
Apply the shared engine theme to:
- Vector Map Editor
- Vector Asset Studio
- Tile Map Editor
- Parallax Editor

Per tool:
- replace divergent shell/header/nav styling with the platform shell
- align panel/button/input/tab/dialog styling to engine theme
- keep existing tool workflows intact
- preserve existing functionality while updating surface appearance

### Phase 3 — Platform Surface Unification
- Ensure tools landing/index/menu uses same engine-themed shell
- Ensure active tool cards/listing/navigation are registry-driven where available
- Ensure naming shown to user matches approved display names
- Ensure legacy Sprite editor is not presented in the active tools surface

### Phase 4 — Validation and Cleanup
- verify all active tools load
- verify no obvious broken paths/imports caused by theme consolidation
- verify no stale references to deprecated tool names
- verify visual consistency across active tools
- verify legacy exclusion behavior

## Acceptance Criteria
- Every active tool clearly uses the engine theme
- Tools look like one coherent platform, not separate mini-apps
- No active tool retains outdated bespoke styling when an engine-theme equivalent exists
- Shared shell/header/nav is consistent across active tools
- Legacy `SpritEditor_old_keep` is preserved but excluded from active tool listings/navigation
- No broken imports, obvious console errors, or missing style assets caused by the change
- Tool names displayed to users are normalized and approved

## Preferred File Placement
Codex should prefer shared theme/platform assets in stable shared locations already used by the engine. If a new shared location is needed, keep it minimal and aligned with existing repo organization.

## Constraints
- Keep this as one combined build PR
- Do not split into multiple follow-up PRs unless blocked by a real technical dependency
- No destructive removal of legacy content
- No unrelated refactors
- Do not introduce a second competing theme system

## Suggested Deliverables from Codex
- shared engine-theme contract/module updates
- active tool shell/theme adoption changes
- tool index/landing/platform surface polish updates
- validation notes and any necessary path fixes

## Codex Execution Intent
This PR is intended to be the shortest path from “mostly organized tools” to “coherent themed platform.” Favor surgical reuse of existing engine theme assets over reinvention.
