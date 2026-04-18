# BUILD PR: 17.8 Samples 1605 To 1608 Core Track

## Purpose
Complete the remaining core Phase 16 / 3D sample track in one testable package now that 1601 through 1604 are visible, loading, and validated.

## Baseline Entering This PR
- 1601 visible and preserved
- 1602 visible after camera/projection calibration
- 1603 available in current progression lane
- 1604 visible after camera/framing calibration
- targeted Phase 16 visibility sanity passes
- targeted launch smoke for 1601-1604 passes

## Scope
Implement and register the remaining core sample track:
- 1605 - 3D Driving Sandbox
- 1606 - 3D Physics Playground
- 1607 - 3D Space Shooter
- 1608 - 3D Dungeon Crawler

## Delivery Rules
- one PR purpose only
- smallest scoped valid change
- keep the package testable
- no commit-only work
- no repo-wide scanning
- no zip output from Codex

## Required Outcomes
- each sample loads from samples/index.html
- each sample has visible 3D output on first load
- each sample demonstrates one clear teaching purpose
- shared Phase 16 helpers are reused where stable
- 1601-1604 remain intact

## Sample Intent
### 1605 - 3D Driving Sandbox
- vehicle-style forward motion and turning
- camera framing appropriate for driving
- bounded arena or simple course

### 1606 - 3D Physics Playground
- visible interaction demonstrating gravity / bounce / motion response
- simple, readable geometry
- not a full engine rewrite

### 1607 - 3D Space Shooter
- forward movement / aiming / projectile loop
- simple target or obstacle field
- clear visible feedback

### 1608 - 3D Dungeon Crawler
- room / corridor traversal
- simple collision-aware exploration
- camera and movement aligned to dungeon readability

## Acceptance Criteria
- [ ] 1605 loads and renders visible 3D content
- [ ] 1606 loads and renders visible 3D content
- [ ] 1607 loads and renders visible 3D content
- [ ] 1608 loads and renders visible 3D content
- [ ] each sample responds to its intended controls
- [ ] samples/index.html is updated correctly for any newly live entries
- [ ] Phase 16 visibility sanity still passes for previously working samples
- [ ] targeted smoke for 1601-1608 passes
- [ ] no 2D regression introduced
- [ ] no networking regression introduced

## Validation
- extend targeted Phase 16 sanity as needed without broadening scope
- run targeted launch smoke for 1601-1608
- update docs/reports/change_summary.txt
- update docs/reports/validation_checklist.txt
