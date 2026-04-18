# BUILD_PR_LEVEL_18_13_TRACK_E_CSS_UI_NORMALIZATION_FOUNDATION - Touched Files

## CSS Cluster
- `src/engine/ui/baseLayout.css`
- `samples/phase-17/shared/overlaySampleLayout.css`

## Direct Consumers
- `samples/phase-17/1708/index.html`
- `samples/phase-17/1709/index.html`
- `samples/phase-17/1710/index.html`
- `samples/phase-17/1711/index.html`
- `samples/phase-17/1712/index.html`
- `samples/phase-17/1713/index.html`

## Roadmap
- `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

## Change Summary
- Added shared chrome classes in `baseLayout.css`:
  - `.ui-chrome-main`
  - `.ui-chrome-canvas`
  - `.ui-chrome-copy`
  - `.ui-chrome-section-muted`
- Removed redundant duplicate declarations from `overlaySampleLayout.css` where replaced by shared classes.
- Updated six overlay sample pages to consume shared chrome classes.
