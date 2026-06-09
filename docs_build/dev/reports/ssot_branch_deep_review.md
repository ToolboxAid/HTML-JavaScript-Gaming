# SSoT Branch Deep Review

PR: PR_26159_046-delete-dead-branches-review-ssot
Branch reviewed: `origin/PR_26151_004-gamefoundry-site-structure-ssot`
Generated: 2026-06-08
Runtime behavior changed: No
Playwright impacted: No

## Branch Position

- Behind main: 338
- Ahead of main: 39
- Changed files not in main: 38
- Local branch was not created.
- Remote branch was preserved.

## Commit Summary

The branch has 39 commits not in main. They break down into these themes:

- Site shell/pathing: shared nav routes, path-aware partial loader, shared shell on home page.
- CSS split: `styles.css` was reduced while new `base.css`, `pages.css`, `tools.css`, and color meaning CSS files were added under `GameFoundryStudio/assets/css/`.
- Page IA: account, arcade, marketplace, learn, community, docs, cloud, publish, tools index, tool builder/creator/publisher, and tool group pages.
- PR artifacts: old `docs/dev` command, commit comment, validation, changed-files, and review diff artifacts.

```text
0aee05215 (origin/PR_26151_004-gamefoundry-site-structure-ssot) Add commit comment for PR_26151_004
25cedf280 Add codex command log for PR_26151_004
ba448e9cf Add validation report for PR_26151_004
c06619ff5 Add codex review diff report for PR_26151_004
829f608ae Add changed files report for PR_26151_004
ef47309bd Restore partial fallback for legacy pages
5e21ad5cf Add organized Tool Publisher page
e5a11aff4 Add organized Tool Creator page
9d8bdfa57 Add organized Tool Builder page
9dd7de321 Add organized Publish page
07cffbcf6 Add organized Cloud page
df9a69b4a Add organized Docs page
3f41ebbed Add organized Community page
17e6f4d05 Add organized Learn page
5216f30db Add organized Marketplace page
2d0f25a97 Add organized Arcade page
9ce8bbb4e Add organized Configuration Admin group page
e59d22ba3 Add organized Design Animation group page
e284e99fc Add organized Media Community group page
e1e0799f0 Add organized Assets Content group page
3bfb96259 Add organized Technology System group page
c532e0e80 Add organized Building Creation group page
481edb60c Add organized Tools index page
aeeba13b8 Add organized Controls page
8157042bd Add organized Branding page
152aa63de Add organized Account page
e7f1524fd Use shared GameFoundryStudio shell on home page
988d0505e Add GameFoundryStudio tool CSS
04a254d07 Add GameFoundryStudio page-specific CSS
4fd54fae4 Add steel gray meaning CSS
2c86d7e13 Add purple meaning CSS
dc4a269ef Add arcade cyan meaning CSS
b649b6cc5 Add forge gold meaning CSS
f2ddbb7e4 Add electric blue meaning CSS
af52eda34 Add molten orange meaning CSS
c06991e2d Add GameFoundryStudio shared base CSS
da4cb2601 Split GameFoundryStudio CSS entry point
dffa67dfc Make GameFoundryStudio partials path aware
53cc15ec4 Update GameFoundryStudio shared nav routes
```

## Diff Stat

```text
 GameFoundryStudio/account/branding.html            |   14 +
 GameFoundryStudio/account/controls.html            |   13 +
 GameFoundryStudio/account/index.html               |   14 +
 GameFoundryStudio/arcade/index.html                |    2 +
 GameFoundryStudio/assets/css/base.css              |   18 +
 .../assets/css/colors/arcade-cyan.css              |    5 +
 .../assets/css/colors/electric-blue.css            |    5 +
 GameFoundryStudio/assets/css/colors/forge-gold.css |    5 +
 .../assets/css/colors/molten-orange.css            |    5 +
 GameFoundryStudio/assets/css/colors/purple.css     |    5 +
 GameFoundryStudio/assets/css/colors/steel-gray.css |    5 +
 GameFoundryStudio/assets/css/pages.css             |    2 +
 GameFoundryStudio/assets/css/styles.css            | 1087 +-------------------
 GameFoundryStudio/assets/css/tools.css             |    5 +
 .../assets/js/gamefoundry-partials.js              |   97 +-
 GameFoundryStudio/assets/partials/header-nav.html  |   42 +-
 GameFoundryStudio/cloud/index.html                 |    2 +
 GameFoundryStudio/community/index.html             |    2 +
 GameFoundryStudio/docs/index.html                  |    2 +
 GameFoundryStudio/index.html                       |   57 +-
 GameFoundryStudio/learn/index.html                 |    2 +
 GameFoundryStudio/marketplace/index.html           |    2 +
 GameFoundryStudio/publish/index.html               |    2 +
 GameFoundryStudio/tools/groups/assets-content.html |    2 +
 .../tools/groups/building-creation.html            |    2 +
 .../tools/groups/configuration-admin.html          |    2 +
 .../tools/groups/design-animation.html             |    2 +
 .../tools/groups/media-community.html              |    2 +
 .../tools/groups/technology-system.html            |    2 +
 GameFoundryStudio/tools/index.html                 |   13 +
 GameFoundryStudio/tools/tool-builder.html          |    2 +
 GameFoundryStudio/tools/tool-creator.html          |    2 +
 GameFoundryStudio/tools/tool-publisher.html        |    2 +
 docs/dev/codex_commands.md                         |   39 +
 docs/dev/commit_comment.txt                        |   15 +
 ...4-gamefoundry-site-structure-ssot-validation.md |   65 ++
 docs/dev/reports/codex_changed_files.txt           |   33 +
 docs/dev/reports/codex_review.diff                 |   15 +
 38 files changed, 434 insertions(+), 1157 deletions(-)
```

## Changed Files Grouped by Area

### Pages

```text
A	GameFoundryStudio/account/branding.html
A	GameFoundryStudio/account/controls.html
A	GameFoundryStudio/account/index.html
A	GameFoundryStudio/arcade/index.html
A	GameFoundryStudio/cloud/index.html
A	GameFoundryStudio/community/index.html
A	GameFoundryStudio/docs/index.html
M	GameFoundryStudio/index.html
A	GameFoundryStudio/learn/index.html
A	GameFoundryStudio/marketplace/index.html
A	GameFoundryStudio/publish/index.html
A	GameFoundryStudio/tools/groups/assets-content.html
A	GameFoundryStudio/tools/groups/building-creation.html
A	GameFoundryStudio/tools/groups/configuration-admin.html
A	GameFoundryStudio/tools/groups/design-animation.html
A	GameFoundryStudio/tools/groups/media-community.html
A	GameFoundryStudio/tools/groups/technology-system.html
A	GameFoundryStudio/tools/index.html
A	GameFoundryStudio/tools/tool-builder.html
A	GameFoundryStudio/tools/tool-creator.html
A	GameFoundryStudio/tools/tool-publisher.html
```

### CSS

```text
A	GameFoundryStudio/assets/css/base.css
A	GameFoundryStudio/assets/css/colors/arcade-cyan.css
A	GameFoundryStudio/assets/css/colors/electric-blue.css
A	GameFoundryStudio/assets/css/colors/forge-gold.css
A	GameFoundryStudio/assets/css/colors/molten-orange.css
A	GameFoundryStudio/assets/css/colors/purple.css
A	GameFoundryStudio/assets/css/colors/steel-gray.css
A	GameFoundryStudio/assets/css/pages.css
M	GameFoundryStudio/assets/css/styles.css
A	GameFoundryStudio/assets/css/tools.css
```

### Navigation / Partials / JS

```text
M	GameFoundryStudio/assets/js/gamefoundry-partials.js
M	GameFoundryStudio/assets/partials/header-nav.html
```

### Docs / Reports

```text
A	docs/dev/codex_commands.md
A	docs/dev/commit_comment.txt
A	docs/dev/reports/PR_26151_004-gamefoundry-site-structure-ssot-validation.md
A	docs/dev/reports/codex_changed_files.txt
A	docs/dev/reports/codex_review.diff
```

### Other

```text
(none)
```

## Ideas Worth Preserving

- Public IA concepts: top-level destinations for Arcade, Marketplace, Learn, Community, Docs, Cloud, and Publish.
- Tool IA concepts: dedicated Tool Builder, Tool Creator, and Tool Publisher pages.
- Tool group concepts: Building / Creation, Technology / System, Assets / Content, Media / Community, Design / Animation, and Configuration / Admin.
- Navigation path awareness idea: branch partial loader adjusted links based on nesting depth. The concept is useful, but current implementation should use the active Theme V2/header infrastructure instead.
- Meaning color taxonomy idea: molten orange, electric blue, forge gold, arcade cyan, purple, and steel gray. Current main already has Theme V2 color surfaces; only taxonomy/content ideas should be reused.

## Obsolete Under Current Theme V2 / Toolbox Structure

- The branch uses a standalone `GameFoundryStudio/` tree. Current main no longer has that path and instead uses root-level pages plus `assets/theme-v2`.
- CSS files under `GameFoundryStudio/assets/css/` are obsolete because current styling ownership is `assets/theme-v2/css/`. Do not copy or merge those CSS files.
- `GameFoundryStudio/assets/partials/header-nav.html` is obsolete relative to current shared header/login/admin behavior. Rebuilding nav should use current partial/session patterns.
- `GameFoundryStudio/assets/js/gamefoundry-partials.js` is obsolete relative to current API-backed local server and Theme V2 partial behavior.
- Old `docs/dev/*` report paths are obsolete relative to current `docs_build/dev/reports/*` workflow.
- The branch predates current dev-runtime, Local Mem/Local DB, Admin My Stuff, Colors, and toolbox registry work.

## Possibly Missing from main

- Some public product destinations may still be missing or not first-class in current main, especially Cloud, Publish, and Docs as public-facing pages.
- Dedicated Tool Builder, Tool Creator, and Tool Publisher concepts may still be useful if they are not covered by current toolbox routes.
- Tool group landing pages may still be useful as content/IA, but should be rebuilt from current toolbox registry/data rather than static legacy pages.
- Account subpage concepts for Branding and Controls may still be useful if current account/admin surfaces do not cover them.

## Recommendation

Recommended action: **rebuild ideas in new Theme V2 PRs, then delete after notes are captured**.

Do not merge the branch wholesale. Do not cherry-pick CSS or old partial code. If work resumes, use this branch only as an archive/reference for IA and page inventory. Create small modern PRs for each surviving idea, using current root paths, Theme V2 CSS, current header/session patterns, and current toolbox registry/data contracts.

Specific safe future slices:

1. Public destination IA review: decide whether Cloud, Publish, and Docs should become current root pages.
2. Toolbox IA review: rebuild Tool Builder / Tool Creator / Tool Publisher as current Theme V2 toolbox pages if still desired.
3. Tool group review: map old group pages to current toolbox categories and registry metadata.
4. Account/Admin review: determine whether Branding and Controls belong under Account, Admin, or Toolbox.

## Validation Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Summarize commits. | PASS | Commit summary and full commit list included. |
| List changed files grouped by page/CSS/navigation/docs. | PASS | Changed files grouped by Pages, CSS, Navigation / Partials / JS, Docs / Reports, and Other. |
| Identify ideas worth preserving. | PASS | See `Ideas Worth Preserving`. |
| Identify obsolete code under Theme V2/current toolbox structure. | PASS | See `Obsolete Under Current Theme V2 / Toolbox Structure`. |
| Identify anything that may still be missing from main. | PASS | See `Possibly Missing from main`. |
| Recommend keep/cherry-pick/rebuild/delete path. | PASS | Recommendation is rebuild ideas in new Theme V2 PRs, preserve branch only until notes are captured, then delete. |
