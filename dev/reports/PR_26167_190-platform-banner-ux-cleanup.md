# PR_26167_190-platform-banner-ux-cleanup

## Summary
- Updated platform banner tone styling so Info uses the Theme V2 green highlight, Warning uses the existing yellow/gold highlight, and Urgent uses the red highlight.
- Moved Banner controls into the Platform Settings center column directly under the Banner message field.
- Retained Notice Type because it is persisted as `platform.banner.kind`; made it visibly meaningful by rendering a notice label in both the public banner and Admin preview.
- Preserved platform-settings as the SSoT and validated save/load through the Admin platform-settings API.

## Branch Validation
- PASS: current branch is `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Hard stop branch guard satisfied on `main`.
- PASS: Info tone uses Theme V2 green/success highlight via `var(--green)`.
- PASS: Warning tone keeps Theme V2 yellow/gold highlight via existing gold tokens.
- PASS: Urgent tone keeps Theme V2 red highlight via `var(--red)`.
- PASS: Notice Type reviewed and retained because the DB/settings contract persists `platform.banner.kind`.
- PASS: Notice Type now visibly controls the rendered notice label:
  - `general` renders `Notice`.
  - `temporary-data` renders `Data notice`.
  - `outage` renders `Outage`.
- PASS: Banner controls now appear in the center column directly under the Banner message textarea.
- PASS: Platform settings remain the SSoT through `/api/platform-settings/banner` and `/api/admin/platform-settings/banner`.
- PASS: No inline scripts, style blocks, or inline event handlers were added.
- PASS: No page-local CSS was added.
- PASS: Styling changes are limited to reusable Theme V2 `status.css` classes/tokens.
- PASS: Full samples smoke was not run, per request.

## Notice Type Decision
- Decision: Retained.
- Reason: `platform.banner.kind` is an existing platform-settings record written by the server seed/runtime contract.
- Visible behavior added: Notice Type now renders a visible label in the public header/footer banner and in the Admin preview. It controls the operational label, while Tone controls the color treatment.
- API payload decision: Retained in the Admin API payload because it remains part of the platform-settings write/read contract.

## Tone Render Evidence
- PASS: Targeted Playwright validated the live banner class for each tone:
  - Info -> `platform-banner--info`.
  - Warning -> `platform-banner--warning`.
  - Urgent -> `platform-banner--danger`.
- PASS: Targeted Playwright compared computed banner background colors and notice-label background colors and confirmed all three tones render distinctly.
- PASS: Public active banner still renders in both required placements: under the header and above the footer.
- PASS: Notice labels render in both placements for active banners.

## Validation Lane Report
- contract lane:
  - PASS: `node --check assets/theme-v2/js/admin-platform-settings.js`
  - PASS: `node --check assets/theme-v2/js/gamefoundry-partials.js`
  - PASS: `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
  - PASS: changed HTML inline script/style/event-handler guard for `admin/platform-settings.html`
  - PASS: `git diff --check`
- integration lane:
  - PASS: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --grep "Platform Settings Admin wireframe|Platform banner renders|Platform banner tones|Platform Settings Admin controls" --workers=1`
  - PASS: Playwright verified save/load through the Admin Preferences service route.
  - PASS: Playwright verified Banner controls are under the Banner message field in the center column.
  - PASS: Playwright verified Notice Type label rendering in the public banner and Admin preview.
- runtime lane:
  - PASS: live DEV API roundtrip read current platform banner, wrote a temporary validation banner, read it back from `platform_settings`, and restored the original banner.
  - PASS: live read-back matched validation payload.
  - PASS: live restore matched original payload.
  - PASS: live write reported `recordsWritten: 4` and `sourceTable: platform_settings`.
- skipped lanes:
  - SKIP: full samples smoke, per request and because this PR only affects Platform Settings banner UX and targeted shared partial rendering.

## Manual Validation Notes
- Admin Preferences/Platform Settings page loads with Banner message first, then Show banner, Notice kind, Tone, and Save Banner controls in the center column.
- Preview now shows the Notice Type label before the message when active.
- Public banner now shows the same Notice Type label under the header and above the footer.
- Live DEV API validation temporarily wrote `PR190 validation banner` and restored the original platform banner state.
- No secrets or `.env.local` changes are included.

## Playwright V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed from the targeted Playwright run.
- PASS: PR190 browser runtime files were collected:
  - `(74%) assets/theme-v2/js/gamefoundry-partials.js - executed lines 750/750; executed functions 49/66`
  - `(100%) assets/theme-v2/js/admin-platform-settings.js - executed lines 112/112; executed functions 17/17`
- WARN: the shared coverage helper also lists HEAD-diff advisory entries from previous committed work; those are not PR190 worktree changes and remain advisory only.

