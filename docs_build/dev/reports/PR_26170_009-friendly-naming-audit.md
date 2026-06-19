# PR_26170_009-friendly-naming-audit

## Branch Validation

PASS - Current branch verified as `main`.

## Scope

Audit-only. No runtime code, routes, folders, metadata, or visible copy were renamed in this PR.

## Friendly Name Recommendations

| Current work-like name | Friendly name | Primary occurrence classes | Recommended PR lane |
| --- | --- | --- | --- |
| Project Workspace / Game Workspace | Game Hub | user-facing, metadata/internal, route/folder, documentation | PR_010 for visible copy and labels; PR_011 for safe labels/constants; PR_012 only after route compatibility plan |
| Project Team | Game Crew | user-facing, metadata/internal, route/folder through `toolbox/users`, documentation | PR_010 for visible copy and labels; PR_011 for safe labels/constants; keep `users` route until PR_012 decision |
| Project Progress | Game Progress | user-facing, documentation | PR_010 where visible; no route/folder rename identified as safe |
| Publishing Progress | Launch Progress | user-facing, implementation variables, documentation | PR_010 for visible copy; PR_011 for safe local variable names |
| Users | Creators | user-facing Admin/Toolbox labels, metadata/internal, route/folder, documentation | PR_010 for visible page/menu labels; PR_011 only for safe display constants; PR_012 route/folder impact required |
| Roles | Responsibilities | user-facing Admin labels, identity metadata/internal, route/folder, documentation | PR_010 for visible labels; PR_011 only for safe display constants; PR_012 route/folder impact required |
| Permissions | Access | user-facing copy, identity contract/internal, documentation | PR_010 for visible prose; PR_011 only for safe display constants; do not rename identity contract keys without a separate contract migration |
| Invitations | Invites | user-facing Admin labels, route/folder, documentation | PR_010 for visible page/menu labels; PR_012 route/file impact required for `admin/invitations.html` |
| Administration | Studio Settings | documentation and broad product copy | PR_010 for visible copy only where exact `Administration` appears; do not rename `Admin` route/menu semantics in this sequence |

## Occurrence Classification

### User-Facing

- Toolbox and page labels:
  - `assets/theme-v2/partials/header-nav.html` displays `Game Workspace`.
  - `toolbox/game-workspace/index.html` displays `Game Workspace`, `Project Workspace`, `Game Progress`, and `Publishing Progress`.
  - `toolbox/project-workspace/index.html` displays deprecated workspace route copy with `Game Workspace`.
  - `toolbox/users/index.html` displays `Project Team` and `Studio Team`.
  - `toolbox/tools-page-accordions.js` renders visible `Publishing Progress`.
  - Toolbox pages such as Tags, Colors, Game Design, Game Configuration, Saved Data, Controls, and Achievements include visible `Game Workspace` handoff text.
- Admin/account labels:
  - `admin/users.html` displays `Users`.
  - `admin/roles.html` displays `Roles` and `permissions`.
  - `admin/invitations.html` displays `Invitations` and `Beta Invitations`.
  - `admin/site-setup.html` displays `Default Roles`.
  - Account achievements copy references `Project Workspace` and `Game Workspace`.
- Owner docs/pages:
  - `owner/grouping-colors.html` displays `Game Workspace`, `Project Team`, and `Studio Team`.
  - `docs_build/dev/admin-notes/tools/index.txt` displays the Create order and Project Team distinction.

### Metadata/Internal

- `src/shared/toolbox/tool-metadata-inventory.js` owns display metadata for `Game Workspace` and `Project Team` while keeping stable ids/routes.
- `src/api/admin-owner-navigation.js` owns Admin menu labels `Invitations`, `Roles`, and `Users` with stable routes.
- `toolbox/tools-page-accordions.js` has visible text and safe local variable names for progress labels.
- Tests contain expected visible labels and should be updated with the PR that changes the visible copy.
- Identity contract names such as users, roles, user_roles, permissions, and invitations are internal/data contracts. They are not safe to rename as friendly copy.

### Route/Folder

- `toolbox/game-workspace/` and compatibility route `toolbox/project-workspace/`.
- `toolbox/users/` for the project-specific team planning page.
- `admin/users.html`, `admin/roles.html`, and `admin/invitations.html`.
- Any route/folder rename requires PR_012 impact documentation, link updates, and compatibility notes. No route/folder is safe to rename before PR_012.

### Documentation

- Active governance and owner-facing docs should move to friendly names as visible documentation in PR_010.
- Historical reports may retain technical context, but active guidance and current PR reports should avoid reintroducing work-like names as current product labels.
- Existing reports with legacy lane names such as `Project Workspace` should be treated as historical unless they describe current visible product copy.

## Safe/Unsafe Decisions For Later PRs

- PR_010 safe: visible copy, page headings, menu labels, tile names, owner notes, and visible documentation.
- PR_010 unsafe: route paths, folder names, data table names, API routes, identity contract keys, and implementation variable identifiers.
- PR_011 safe: local implementation variable names where the DOM/data contract stays unchanged; registry/display constants that are not route ids or persisted keys.
- PR_011 unsafe: id keys, route keys, folder names, database table names, API route names, and compatibility aliases.
- PR_012 safe only after impact documentation: `toolbox/game-workspace`, `toolbox/project-workspace`, `toolbox/users`, `admin/users.html`, `admin/roles.html`, and `admin/invitations.html`.
- PR_012 likely recommendation: preserve current route/folder names until a dedicated migration can add redirects/aliases and update deep links.

## Requirement Checklist

- PASS - Audited requested friendly-name targets across Toolbox, owner notes, page labels, visible copy, metadata/internal surfaces, route/folder surfaces, variables, and docs.
- PASS - Classified occurrence types as user-facing, metadata/internal, route/folder, and documentation.
- PASS - Recommended friendly names exactly as requested, with `Game Workspace` included under the Project Workspace -> Game Hub migration because it is the current visible successor label.
- PASS - No runtime code was renamed in this PR.

## Impacted Lane

- Documentation/static lane only.

## Validation

- PASS - `git branch --show-current` returned `main`.
- PASS - Targeted fixed-string searches were run for the requested names across `docs_build`, `owner`, `toolbox`, `src`, `tests`, `admin`, `account`, and `assets`.
- PASS - Report review confirmed this PR contains audit documentation only.

## Playwright Decision

- Playwright impacted: No. This PR changed only audit/build/report documentation.

## Skipped Lanes

- Runtime: skipped because no runtime files were renamed.
- Integration: skipped because no route, API, or handoff behavior changed.
- Engine: skipped because no engine code changed.
- Samples: skipped per request.
- recovery/UAT: skipped because this is not a recovery lane change.

## Manual Test Notes

- Review this report before PR_010 to confirm that friendly visible-copy changes remain separate from metadata/internal and route/folder renames.

## Samples Decision

- Full samples validation was not run.
