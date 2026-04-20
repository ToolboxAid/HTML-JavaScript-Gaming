# BUILD_PR_STYLE_13_15_THEMING_AND_UX_CONSISTENCY

## Purpose
Finish the next safe grouped style slice by bundling STYLE_13 through STYLE_15 into one execution-backed PR.

## Single PR Purpose
Standardize theme language and cross-tool UX consistency:
- STYLE_13 — Color System & Theming
- STYLE_14 — Micro Polish & Feedback
- STYLE_15 — Tool UX Consistency Pass

## Sequence Rule
- Continue the lowest unfinished STYLE first.
- This PR is valid only after STYLE_07 and STYLE_10–12 are complete.
- Do not start STYLE_16+ implementation work in this PR.
- Roadmap handling is execution-backed and append-only.

## Scope
- define and apply semantic color tokens
- unify panel/background/text contrast behavior
- standardize hover/disabled/feedback states
- add subtle, fast, non-distracting polish only
- unify tool UX patterns across migrated tools
- preserve the shared shell/layout from STYLE_06–09
- preserve interaction/hierarchy/component work from STYLE_10–12
- do not redesign tools
- do not introduce per-tool theme forks unless required for functionality

## Required Rules
1. Preserve the shared theme and shell foundations already in place.
2. No embedded `<style>` blocks.
3. No inline `style=""`.
4. No JS-generated styling.
5. Keep layout changes minimal; this is not a shell redesign PR.
6. Apply theming through shared theme files only.
7. Keep the change visually testable and narrow relative to the three bundled style items.

## STYLE_13 — Color System & Theming
Implement on the migrated tool set:
- semantic color tokens for primary/success/warning/danger/info where appropriate
- consistent panel/background layer contrast
- readable text contrast
- consistent accent usage
- no arbitrary one-off color usage

## STYLE_14 — Micro Polish & Feedback
Implement on the migrated tool set:
- consistent hover states
- clearly visible disabled states
- subtle fast transitions where useful
- no visual jitter during updates
- status/feedback treatment that does not shift layout

## STYLE_15 — Tool UX Consistency Pass
Implement on the migrated tool set:
- consistent placement of primary actions
- consistent placement of secondary actions
- consistent panel ordering/patterns where practical
- no unjustified tool-specific UX deviations
- unified navigation/interaction cues

## Validation Targets
Use the migrated shell tools as the validation set.

## Acceptance
- STYLE_13 theming work is execution-backed on migrated tools
- STYLE_14 polish/feedback work is visible and consistent
- STYLE_15 UX consistency work is visible across migrated tools
- no layout shell regression
- no inline/embedded styling added
- change remains visually testable
