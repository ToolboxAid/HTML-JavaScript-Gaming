# PR_26155_042 Admin Project Data Banner

## Summary

Added an admin-only Project Data wireframe menu to the existing Toolbox role banner row.

Admin row text now includes:

`ADMIN VIEW • Planned tools visible • Switch to Creator View • Project Data ▾`

## Behavior

Supported role modes remain:
- `?role=guest`
- `?role=user`
- `?role=admin`

Visibility:
- Guest view hides Project Data controls.
- Creator view hides Project Data controls.
- Admin view shows Project Data controls.

Project Data submenu actions:
- Reset Project Data
- Seed Demo Project
- Clear Test Data

The actions are native button controls with no destructive behavior wired in this PR.

## Theme V2 Use

Existing Theme V2 classes only:
- role row container: `container callout`
- role banner and Project Data menu: `status`
- submenu action stack: `content-stack content-stack--compact`
- buttons: `btn`

No CSS, page-local CSS, inline styles, style blocks, DB, auth, cloud, persistence, or new tools were added.

## Manual Test Notes

- `?role=guest` shows the guest banner and no visible Project Data controls.
- `?role=user` shows the creator banner and no visible Project Data controls.
- `?role=admin` shows the admin banner and Project Data submenu.
- Project Data submenu contains Reset Project Data, Seed Demo Project, and Clear Test Data.
- Clicking the buttons does not mutate `localStorage` or `sessionStorage`.
- No duplicate Admin appears under Toolbox.
- No console errors were observed by the Playwright lane.

## Validation Notes

Impacted lane: `workspace-contract` through `npm run test:workspace-v2`.

Validation run:
- `npm run test:workspace-v2` passed with 4 Playwright tests.
- `git diff --check` passed.

Skipped lanes:
- runtime
- integration
- engine
- samples
- recovery/UAT

Skipped-lane rationale: this is an inert Toolbox page/header wireframe control and docs contract bundle. No shared runtime, real persistence, parser, engine, sample, or cross-tool behavior changed.

Theme V2 gap findings: none.
