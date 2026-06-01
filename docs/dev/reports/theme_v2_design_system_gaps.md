# Theme V2 Design System Gaps

Task: PR_26152_024-theme-v2-company-pages

Migration order:
1. Home
2. Company
3. Admin
4. Account
5. Tools
6. Games
7. Samples

Discovered gaps:

## Elevation and Effects Ownership

- Gap: The approved Theme V2 ownership list does not include a dedicated elevation, effects, or shadow file.
- Affected surfaces: Home and Company pages now; future Admin, Account, Tools, Games, and Samples migrations are also likely to need shared elevation tokens.
- Current handling: Reusable shadow tokens remain in `spacing.css` because no additional CSS ownership file is approved.
- Follow-up plan: Confirm whether elevation/effects tokens should remain in `spacing.css` or whether a future governance PR should approve a dedicated Theme V2 ownership file.
- Local workaround used: None.

## Legacy Page Class Names

- Gap: Migrated Company pages still use existing page-era class names such as `about-hero`, `page-title`, `callout`, `release-stage`, `version-item`, and `timeline-placeholder`.
- Affected surfaces: Company pages now; Admin and Account pages may expose similar legacy page-era class names during their migrations.
- Current handling: The classes were promoted into approved Theme V2 ownership files to preserve visual parity and avoid page-local CSS.
- Follow-up plan: During Admin and Account migrations, decide whether these names remain the reusable Theme V2 vocabulary or should be replaced by approved component names.
- Local workaround used: None.

## About Hero Media Pattern

- Gap: Theme V2 does not yet define a general media/background hero pattern for pages that need a branded image treatment.
- Affected surfaces: `about.html` now, and likely future Company or marketing-style pages.
- Current handling: `about-hero` is supported in Theme V2 and points to the existing `forge-bot-single.png` asset because the legacy `forge-bot.png` target is not present in the current workspace.
- Follow-up plan: Promote this into a general reusable media hero pattern before additional branded image heroes are migrated.
- Local workaround used: None.

No blocking design-system gaps were found for the Company page migration.
