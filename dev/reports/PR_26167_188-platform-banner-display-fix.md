# PR_26167_188-platform-banner-display-fix

## Root Cause

The platform banner contract mixed `enabled` and `active` names. The live table had the banner message saved, but the active setting row was still `false`, so `/api/platform-settings/banner` correctly returned inactive data and both the Admin preview and header banner displayed no active banner.

Fix: make `active` the single browser/API contract name, keep the existing `platform.banner.enabled` table setting key for row continuity, and add diagnostics that expose active state, message, and source table row key.

## Branch Validation

PASS - current branch is `main`.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before implementation. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Investigate Admin Preferences save | PASS | Found Admin save used an `enabled` payload name instead of the public `active` banner contract. |
| Investigate platform settings table write | PASS | Live DB row evidence confirmed message row existed while active row value was `false` before the fix. |
| Investigate `/api/platform-settings/banner` response | PASS | Before payload had `active: false`, populated message, and source row key; after save had `active: true`. |
| Investigate `requestPlatformBanner()` | PASS | Confirmed it reads `/api/platform-settings/banner` and normalizes the public banner payload. |
| Investigate `renderPlatformBanner()` | PASS | Confirmed it removes the banner when `active` is false or message is empty, and renders under header when active. |
| Determine if active flag was not being saved | PASS | Live before state showed active row `false`; fixed Admin save sends `active: true/false`. |
| Determine if API returns inactive banner | PASS | Before payload returned inactive; after fixed save returned active. |
| Determine if API shape mismatched `normalizedPlatformBanner()` | PASS | Fixed contract to use `active` consistently; tests now use active-only mocked API payloads. |
| Determine if banner message stored in wrong field | PASS | Message was stored in `platform.banner.message`; not the root cause. |
| Determine if read path differs from save path | PASS | Both read and save use `platform_settings`; diagnostics now expose the source row key. |
| Fix root cause | PASS | Admin payload, Admin UI hook, server update normalization, public normalization, and tests now use `active`. |
| Add diagnostics showing active state, message, source table row key | PASS | API returns `diagnostics`; Admin page shows visible diagnostics; renderer exposes `window.GameFoundryPlatformBannerDiagnostics`. |
| Keep platform-settings as SSoT | PASS | Reads/writes remain through `platform_settings` API/service contract only. |
| No browser-owned banner data | PASS | Browser code calls server API; no local persistence or page-owned banner records. |
| No silent fallback | PASS | API errors throw/report status; inactive banners are explicit `active: false`, not fallback data. |
| Save banner `banner is active!@!!` | PASS | Live validation saved exact message with active true. |
| Verify row exists in DB | PASS | Live DB row evidence listed active/message/tone/kind `platform_settings` rows. |
| Verify GET returns active=true and message populated | PASS | Live public API after active save returned `active: true` and exact message. |
| Verify banner renders under header | PASS | Live browser validation found header before banner and banner before main with exact message. |
| Verify banner removed when active=false | PASS | Live public API returned `active: false`; browser validation found rendered banner count 0. |
| Run targeted platform-settings Playwright | PASS | 2/2 targeted Playwright tests passed. |
| Do not run full samples smoke | PASS | Full samples smoke was not run. |

## Before API Payload

`GET /api/platform-settings/banner` before the fix returned:

```json
{
  "status": 200,
  "banner": {
    "active": false,
    "kind": "general",
    "message": "banner is active!@!!",
    "sourceTableRowKey": "01KV8W32ZERK6CD5W270QPBC18",
    "sourceTable": "platform_settings",
    "tone": "info"
  },
  "diagnostics": {
    "active": false,
    "message": "banner is active!@!!",
    "sourceTable": "platform_settings",
    "sourceTableRowKey": "01KV8W32ZERK6CD5W270QPBC18"
  }
}
```

## After API Payload

After saving `active: true` with message `banner is active!@!!`, `GET /api/platform-settings/banner` returned:

```json
{
  "status": 200,
  "banner": {
    "active": true,
    "kind": "temporary-data",
    "message": "banner is active!@!!",
    "sourceTableRowKey": "01KV8W32ZERK6CD5W270QPBC18",
    "sourceTable": "platform_settings",
    "tone": "warning"
  },
  "diagnostics": {
    "active": true,
    "message": "banner is active!@!!",
    "sourceTable": "platform_settings",
    "sourceTableRowKey": "01KV8W32ZERK6CD5W270QPBC18"
  }
}
```

After saving `active: false`, the public API returned `active: false` with the same message and source row key.

## DB Row Evidence

After active save:

| Setting key | Row key | Value | Active row |
| --- | --- | --- | --- |
| `platform.banner.enabled` | `01KV8W32ZERK6CD5W270QPBC18` | `true` | true |
| `platform.banner.message` | `01KV8W32ZE2XZMG1HY8XJM09Q7` | `banner is active!@!!` | true |
| `platform.banner.tone` | `01KV8W32ZE3ZC91PRWECZX16H4` | `warning` | true |
| `platform.banner.kind` | `01KV8W32ZE870AYSVT62X4JTY5` | `temporary-data` | true |

After inactive save:

| Setting key | Row key | Value | Active row |
| --- | --- | --- | --- |
| `platform.banner.enabled` | `01KV8W32ZERK6CD5W270QPBC18` | `false` | true |
| `platform.banner.message` | `01KV8W32ZE2XZMG1HY8XJM09Q7` | `banner is active!@!!` | true |

## Rendered Banner Evidence

Live browser validation after active save:

```json
{
  "message": "banner is active!@!!",
  "headerBeforeBanner": true,
  "bannerBeforeMain": true,
  "diagnostics": {
    "active": true,
    "message": "banner is active!@!!",
    "sourceTable": "platform_settings",
    "sourceTableRowKey": "01KV8W32ZERK6CD5W270QPBC18"
  }
}
```

Live browser validation after inactive save:

```json
{
  "renderedInactiveBannerCount": 0
}
```

## Validation Lane Report

| Lane | Result | Notes |
| --- | --- | --- |
| Static syntax | PASS | `node --check` for changed JS/MJS files passed. |
| HTML restriction scan | PASS | No inline script/style/event handlers found in `admin/platform-settings.html`. |
| Contract/API test | PASS | `node --test --test-name-pattern="Platform banner reads and writes through platform settings service routes" tests/dev-runtime/SupabaseProductDataCutover.test.mjs`. |
| Targeted Playwright | PASS | `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --grep "Platform banner renders|Platform Settings Admin controls" --workers=1` passed 2/2. |
| Live manual validation | PASS | Saved exact banner message, verified DB rows, verified public API active true, verified render, then verified active false removes banner. |
| Playwright V8 coverage | PASS | PR188-scoped report written to `docs_build/dev/reports/playwright_v8_coverage_report.txt`; server-side route module reported as browser V8 WARN. |
| Full samples smoke | SKIP | Explicitly excluded by request. |

## Manual Validation Notes

- DavidQ sign-in for the live validation returned creator/admin roles; the password value was not printed or written to files.
- Final live banner state after validation is inactive (`active: false`) with the message retained in `platform_settings`; the header banner does not render while inactive.
- No `.log` or `.txt` files were created under repo `tmp`.

