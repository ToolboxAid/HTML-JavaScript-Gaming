# PR_26166_158-account-flow-error-polish

## Branch Validation

- Current branch: main
- Expected branch: main
- Branch validation: PASS

## Purpose

Polish user-facing account errors and remove provider/internal wording from active account flows.

## Requirement Checklist

- PASS - Generic unavailable message remains for site/provider failures: `The site is currently unavailable. Please try again later.`
- PASS - Identity provisioning failures show the actionable support message: `Account identity setup is incomplete. Please contact support.`
- PASS - Active Create Account and Password Reset copy says `account service`, not provider-specific wording.
- PASS - No DEV wording appears in active account flow UI.
- PASS - Browser still calls backend API contracts only.
- PASS - No secrets, `.env`, password tables, or auth fallback changes were added.

## Implementation Evidence

- `assets/theme-v2/js/account-auth-actions.js` now allows only the safe identity setup support message through failed auth responses; other failed responses remain generic.
- `assets/theme-v2/js/login-session.js` uses the same safe-message rule for Sign In.
- `account/create-account.html` and `account/password-reset.html` now use account-service wording.
- `assets/theme-v2/js/gamefoundry-partials.js` no longer tells users to sign in as a `local user` on protected Account pages.

## Changed Files

- `account/create-account.html`
- `account/password-reset.html`
- `assets/theme-v2/js/account-auth-actions.js`
- `assets/theme-v2/js/login-session.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`

## Validation Lane Report

- static: PASS - changed-file syntax checks passed.
- Playwright: PASS - targeted browser test confirms identity setup support message renders and provider details are not exposed.
- samples: SKIP - explicitly out of scope.

## Playwright V8 Coverage

- Artifact: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Status: WARN advisory for some changed JS files not collected by current Chromium V8 coverage; behavior passed through Playwright.

## Skipped Lanes

- samples: SKIP - explicitly out of scope.
- full workspace suite: SKIP - targeted auth/session validation was requested for this stack.

## Manual Validation Notes

1. Temporarily create an Auth user without a matching app identity row.
2. Attempt Sign In.
3. Confirm the page shows `Account identity setup is incomplete. Please contact support.`
4. Break or omit auth configuration and confirm the page shows the generic unavailable message.
5. Confirm Create Account and Password Reset pages use account-service language.
