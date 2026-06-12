# PR_26163_066-user-controls-layout-polish

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.
- Evidence: `git branch --show-current` returned `main`.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS: `account/user-controls.html` renders Supported Control Types with `list--multi-column list--multi-column-3`.
- PASS: Supported Control Types render as exactly 3 columns.
- PASS: Bullet alignment is maintained with the existing outside bullet positioning and padding from `list--multi-column`.
- PASS: Alphabetical ordering remains unchanged because the DOM order is still generated from the sorted `SUPPORTED_CONTROL_TYPES` list.
- PASS: Columns fill top-to-bottom, then left-to-right; Playwright validates column-local top order and cross-column index order.
- PASS: Controller selection toolbar renders as one line: `[ Refresh Devices ] [ Controller ] [ Controller Dropdown ] [ Create User Control Profile ]`.
- PASS: Controller dropdown consumes remaining horizontal space with reusable `content-cluster__grow`.
- PASS: Controller names do not force the toolbar onto multiple lines at 1440px desktop width; Playwright validates no-wrap layout before and after selecting a controller.
- PASS: Refresh Devices and Create User Control Profile remain visible and sized to content.
- PASS: Workflow/profile behavior was not changed; no account runtime JavaScript changed.
- PASS: Reused and extended Theme V2 only; no page-local CSS, inline styles, or new layout system.

## Theme V2 Notes

- Existing Theme V2 already had `list--multi-column` for 2-column lists and `content-cluster` for wrapping control rows.
- This PR added small reusable modifiers in Theme V2:
  - `list--multi-column-3`
  - `content-cluster--nowrap`
  - `content-cluster__grow`
- These are reusable modifiers on existing Theme V2 patterns, not page-local CSS.

## Changed Files

- `account/user-controls.html`
- `assets/theme-v2/css/layout.css`
- `assets/theme-v2/css/typography.css`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/PR_26163_066-user-controls-layout-polish.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Impacted Lane

- Account/User Controls layout lane.
- Theme V2 reusable CSS modifier lane.
- Targeted Account/User Controls Playwright lane.
- Required legacy workspace command: `npm run test:workspace-v2`.

Note: `npm run test:workspace-v2` is a legacy command name retained by repo scripts.

## Skipped Lanes

- Full samples smoke: SKIP. Safe because this PR changes account layout/CSS and targeted Playwright assertions only; no sample JSON, sample loader, or game runtime sample path changed.
- Engine input lane: SKIP. Safe because `src/engine/input` was not modified.
- Account/User Controls runtime DB lane: SKIP. Safe because no runtime JavaScript or persistence behavior changed.

## Testing Performed

- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check`
- PASS: `rg -n "<style| on[a-z]+=" account/user-controls.html` returned no inline style/event handler matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns physical input mapping accordions and profiles" --reporter=line` passed 1 test.
- PASS: `npm run test:workspace-v2` passed; workspace-contract lane reported 5 passed.

## Playwright Result

- PASS: Targeted Account/User Controls Playwright checks passed.
- PASS: Required `npm run test:workspace-v2` passed.

## Coverage

- PASS: Playwright V8 coverage report was not produced for PR066 because no runtime JavaScript changed.

## Manual Validation Steps

1. Open `/account/user-controls.html` at a normal desktop width.
2. Open Supported Control Types and confirm it displays exactly 3 bullet columns.
3. Confirm Supported Control Types remains alphabetical and fills down each column before continuing to the next column.
4. Open Game Controllers and confirm the toolbar stays on one line.
5. Confirm Refresh Devices and Create User Control Profile remain visible and content-sized.
6. Confirm the Controller dropdown expands to use the available horizontal space.
7. Refresh devices, select a detected controller, and confirm the selected controller name does not wrap the toolbar.

## Samples Validation Decision

- SKIP: Full samples smoke was not run because no samples, sample JSON, sample loader, or production game runtime behavior changed.

## ZIP Artifact

- PASS: Repo-structured delta ZIP produced at `tmp/PR_26163_066-user-controls-layout-polish_delta.zip`.
