# PR_26170_010-friendly-visible-copy

## Branch Validation
- PASS: `git branch --show-current` returned `main`.

## Requirement Checklist
- PASS: Applied approved friendly names to user-facing Toolbox labels and tile names.
  - Evidence: `Game Workspace` visible labels became `Game Hub`; `Project Team` became `Game Crew`; `Publishing Progress` became `Launch Progress`.
- PASS: Applied approved friendly names to page headings and visible copy.
  - Evidence: Admin `Users`, `Roles`, and `Invitations` pages now render as `Creators`, `Responsibilities`, and `Invites`.
- PASS: Updated owner notes and visible documentation.
  - Evidence: `owner/grouping-colors.html`, `docs_build/dev/PROJECT_INSTRUCTIONS.md`, and relevant admin-note text files use `Game Hub`, `Game Crew`, `Creators`, and `Access` wording.
- PASS: Preserved routes, folders, and stable data keys.
  - Evidence: paths such as `toolbox/game-workspace/index.html`, `toolbox/users/index.html`, `admin/users.html`, `admin/roles.html`, and `admin/invitations.html` remain unchanged.
- PASS: Preserved implementation contracts while refreshing visible metadata.
  - Evidence: data contract names such as `users`, `roles`, `user_roles`, `game-workspace`, and `admin-invitations` remain unchanged.
- PASS: Avoided inline CSS, inline JavaScript, `<style>`, `<script>` blocks without `src`, and inline event handlers in changed HTML.
  - Evidence: targeted HTML restriction scan passed.

## Impacted Lane
- Toolbox/public UI lane: visible labels, tile names, Game Journey group rendering, and Game Hub/Tags visible metadata.
- Admin/account UI lane: Admin navigation/page labels, Admin Invites visible status copy, Account Achievements Game Hub wording.
- Dev-runtime display lane: local API visible diagnostics and DB-backed metadata display sync for stale local rows.

## Skipped Lanes
- Samples: SKIP. No sample files or sample runtime behavior were changed.
- Engine runtime: SKIP. No engine runtime contracts were changed.
- Broad DB migration: SKIP. Stable DB table names and keys were preserved; only visible labels/status text changed.
- Full Playwright suite: SKIP. Scope was visible copy and targeted Toolbox/Admin rendering.

## Validation Lane Report
- PASS: `node --check` for every touched `.js` and `.mjs` file.
- PASS: `git diff --check`.
- PASS: changed HTML restriction scan using `rg --pcre2`.
- PASS: targeted Playwright command:
  - `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs tests/playwright/tools/AdminInvitationsNavPage.spec.mjs --grep "toolbox index shows|toolbox grouped view|Admin menu renders|Admin Invites uses" --workers=1 --reporter=list`
  - Result: 4 passed.

## Playwright Notes
- Initial broader Playwright attempt included `ToolboxAdminMetadataSsot.spec.mjs` and failed on removed `/api/local-db/snapshot`, which is outside this visible-copy PR.
- Initial Toolbox rendering failed because stale local DB metadata rows kept `Game Workspace`; fixed by extending the existing source-controlled metadata sync allowlist to `game-workspace` and `tags`.
- Initial Admin Invites test failed because the test did not point browser-safe API config at the test server; fixed test setup to mirror existing Admin boundary test setup.

## Manual Test Notes
- Verified Toolbox source now exposes `Game Hub` and `Game Crew` while routes remain `game-workspace` and `users`.
- Verified Admin navigation labels render as `Invites`, `Responsibilities`, and `Creators`.
- Verified changed HTML files do not introduce inline style/script/event-handler patterns.

## Samples Decision
- SKIP: full samples validation was not run because this PR does not touch sample JSON, sample launch behavior, or engine sample contracts.
