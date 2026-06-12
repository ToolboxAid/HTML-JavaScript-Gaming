# PR_26163_052-user-controls-device-selection-and-capture-fix

## Summary

Implemented the User Controls device-selection and capture cleanup as a scoped Account/User Controls PR.

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- PASS: Verified current branch is `main` before edits.
- PASS: Updated `account/user-controls.html` Supported Control Types to use a bulleted multi-column list through reusable Theme V2 CSS.
- PASS: Supported Control Types render alphabetically.
- PASS: Bullet/list alignment stays outside with reusable `.list--multi-column` styling.
- PASS: Selected Device radio controls moved into the Physical Controller tables, left of selectable Default/Profile/Detected rows.
- PASS: Selected radio remains DB-backed as the user's active Physical Controller choice.
- PASS: MouseButton0 capture completes once and does not immediately reopen capture.
- PASS: Scope stayed limited to Account/User Controls HTML, its external JS/CSS dependencies, targeted Playwright tests, and reports.
- PASS: Full samples smoke was not run because samples and sample loaders were not touched.

## Changed Files

- `account/user-controls.html`
- `account/user-controls-page.js`
- `assets/theme-v2/css/typography.css`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_052-user-controls-device-selection-and-capture-fix.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Impacted Lane

- Account/User Controls runtime lane.
- Targeted Controls/User Controls Playwright coverage.
- Theme V2 typography utility, limited to reusable list layout.

## Skipped Lanes

- Samples: SKIP. No sample JSON, sample loader, or playable sample runtime changed.
- Broad engine lanes: SKIP. Input engine contracts were consumed unchanged.
- Production auth/account system: SKIP. No production account behavior changed.

## Validation Performed

- PASS: `git branch --show-current`
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check -- account/user-controls-page.js account/user-controls.html assets/theme-v2/css/typography.css tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: HTML restriction check found no inline style/script/event handlers in `account/user-controls.html`.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns physical input mapping accordions and profiles"`
- PASS: `npm run test:workspace-v2`
- PASS: Re-ran targeted User Controls Playwright after workspace validation to refresh the final V8 coverage report for changed runtime JS.

## Playwright Result

PASS

- Targeted User Controls Playwright: 1 passed.
- `npm run test:workspace-v2`: 5 passed.

## Coverage

PASS

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` includes changed runtime JS coverage.
- `account/user-controls-page.js`: 93% reported by Playwright V8 coverage.
- Test spec files are listed as changed JS but are not browser runtime JS; this is expected and non-blocking.

## Manual Validation Steps

1. Open `/account/user-controls.html`.
2. Confirm Supported Control Types appears as an alphabetized bulleted multi-column list.
3. Confirm the standalone Selected Device radio group is gone.
4. Confirm Selected Device radios appear in the first column beside Default Profile, saved profile, and detected controller rows.
5. Select a profile/default radio and confirm the Selected Device status updates.
6. Create a Mouse profile, click the first Physical Input textbox, press/click mouse Button 0, and confirm `MouseButton0` remains captured without reopening capture.
7. Reload and confirm selected device/profile and saved profile data persist through the shared DB/mock adapter.

## Samples Decision

SKIP

Reason: The PR does not touch sample JSON, sample launch behavior, or shared sample runtime code.

## Completion

PASS: Every requested item is implemented, validated, and marked PASS.
