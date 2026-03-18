# Tasks — PR-001 engine/core boundary pass

## Required
- [ ] Add `engine/core` boundary section to `docs/ENGINE_STANDARDS.md`
- [ ] Add `engine/core` public/internal/transitional classification to `docs/ENGINE_API.md`
- [ ] Add `engine/core` findings summary to `docs/reviews/architecture-review-v1.md`
- [ ] Add PR-001 status/update entry to `docs/reviews/pr-roadmap.md`
- [ ] Add consumer guidance for games/samples:
  - [ ] use `GameBase` as runtime entry
  - [ ] avoid direct imports from runtime internals unless explicitly documented

## Optional
- [ ] Create `docs/ENGINE_BOUNDARIES.md`
- [ ] Create `docs/prs/PR-001-engine-core-boundary.md`

## Out of scope
- [ ] do not change `GameBase` constructor behavior
- [ ] do not convert static services to instance services
- [ ] do not move files yet
- [ ] do not change runtime loop semantics
