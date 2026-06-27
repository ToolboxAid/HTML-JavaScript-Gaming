# Remote Branch Review

PR: PR_26159_045-remote-branch-review
Generated: 2026-06-08
Runtime behavior changed: No
Playwright impacted: No

## Branch Guard

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS
- Local branches found:

```text
* main
```

## Method

- Remote refs were refreshed with `git fetch origin` without pruning or deleting branches.
- Behind/ahead counts use `git rev-list --left-right --count main...origin/<branch>`.
- Commits not in main use `git log --oneline --decorate main..origin/<branch>`.
- Changed files and stats use `git diff main...origin/<branch>`.
- No branches were deleted, merged, or cherry-picked.

## Remote Branches Found

```text
  origin/PR_26151_004-gamefoundry-site-structure-ssot
  origin/PR_26159_035-colors-picker-layout-tags
  origin/PR_26159_036-colors-picker-preview-layout
  origin/recover/70f1301b
```

## Executive Summary

| Branch | Behind | Ahead | Unique files | Already merged/superseded | Unique work may be missing | Recommended action |
| --- | ---: | ---: | ---: | --- | --- | --- |
| `PR_26159_036-colors-picker-preview-layout` | 7 | 0 | 0 | Yes | No | delete |
| `PR_26159_035-colors-picker-layout-tags` | 8 | 0 | 0 | Yes | No | delete |
| `PR_26151_004-gamefoundry-site-structure-ssot` | 337 | 39 | 38 | Partially | Possibly | convert to new small PR |
| `recover/70f1301b` | 1605 | 0 | 0 | Yes | No | delete |

## PR_26159_036-colors-picker-preview-layout

Remote ref: `origin/PR_26159_036-colors-picker-preview-layout`

- Behind count: 7
- Ahead count: 0
- Commits not in main: 0
- Changed files not in main: 0

### Plain-English Summary

Historical Colors picker-preview layout branch. Against current main it has no unique commits, no unique files, and no diff; the picker preview layout work has already been incorporated into or superseded by later Colors PRs on main.

### Already Merged or Superseded?

Yes. Ahead count is 0, the branch is an ancestor/older state relative to main, and there are no changed files not in main.

### Unique Work That May Be Missing from main

No unique missing work detected from this branch.

### Recommended Action

delete

### File Category Classification

No unique changed files.

### Commits Not in main

```text
(none)
```

### Diff Stat

```text
(no diff)
```

### Changed Files Not in main

```text
(none)
```

## PR_26159_035-colors-picker-layout-tags

Remote ref: `origin/PR_26159_035-colors-picker-layout-tags`

- Behind count: 8
- Ahead count: 0
- Commits not in main: 0
- Changed files not in main: 0

### Plain-English Summary

Historical Colors picker layout/tags branch. Against current main it has no unique commits, no unique files, and no diff; the useful tag/layout work appears already incorporated into or superseded by later Colors PRs on main.

### Already Merged or Superseded?

Yes. Ahead count is 0, the branch is an ancestor/older state relative to main, and there are no changed files not in main.

### Unique Work That May Be Missing from main

No unique missing work detected from this branch.

### Recommended Action

delete

### File Category Classification

No unique changed files.

### Commits Not in main

```text
(none)
```

### Diff Stat

```text
(no diff)
```

### Changed Files Not in main

```text
(none)
```

## PR_26151_004-gamefoundry-site-structure-ssot

Remote ref: `origin/PR_26151_004-gamefoundry-site-structure-ssot`

- Behind count: 337
- Ahead count: 39
- Commits not in main: 39
- Changed files not in main: 38

### Plain-English Summary

Older GameFoundryStudio site-structure branch. It adds a standalone GameFoundryStudio page tree, split CSS files, partial navigation changes, organized account/tool/group pages, and PR validation artifacts. It appears to predate the current Theme V2/root page structure and the newer local API/dev-runtime work on main.

### Already Merged or Superseded?

Partially. The branch has 39 unique commits, so it is not merged. However it is 337 commits behind main and targets older GameFoundryStudio paths/styles that appear structurally superseded by current root/assets/theme-v2 organization.

### Unique Work That May Be Missing from main

Possibly. IA/content ideas such as organized Tool Builder/Creator/Publisher pages and grouped tool pages may be useful, but they should not be merged wholesale because the branch uses older path and CSS ownership patterns.

### Recommended Action

convert to new small PR

### File Category Classification

- config: 1
- CSS: 10
- docs: 5
- generated artifacts: 5
- runtime: 1
- UI: 22

### Commits Not in main

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

### Diff Stat

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

### Changed Files Not in main

```text
A	GameFoundryStudio/account/branding.html
A	GameFoundryStudio/account/controls.html
A	GameFoundryStudio/account/index.html
A	GameFoundryStudio/arcade/index.html
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
M	GameFoundryStudio/assets/js/gamefoundry-partials.js
M	GameFoundryStudio/assets/partials/header-nav.html
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
A	docs/dev/codex_commands.md
A	docs/dev/commit_comment.txt
A	docs/dev/reports/PR_26151_004-gamefoundry-site-structure-ssot-validation.md
A	docs/dev/reports/codex_changed_files.txt
A	docs/dev/reports/codex_review.diff
```

## recover/70f1301b

Remote ref: `origin/recover/70f1301b`

- Behind count: 1605
- Ahead count: 0
- Commits not in main: 0
- Changed files not in main: 0

### Plain-English Summary

Recovery branch with no commits ahead of main. It contains no unique changed files or diff against main and appears to be a stale recovery pointer.

### Already Merged or Superseded?

Yes. Ahead count is 0 and there are no commits or files not in main.

### Unique Work That May Be Missing from main

No unique missing work detected from this branch.

### Recommended Action

delete

### File Category Classification

No unique changed files.

### Commits Not in main

```text
(none)
```

### Diff Stat

```text
(no diff)
```

### Changed Files Not in main

```text
(none)
```

## Special Attention Notes

- `PR_26151_004-gamefoundry-site-structure-ssot`: 39 commits ahead and 337 behind. It contains potentially useful site IA/page organization ideas, but should be converted into new small PRs rather than merged wholesale.
- `recover/70f1301b`: 0 ahead and no unique files. It appears safe to delete later, but this PR intentionally does not delete branches.
- Colors branches: both are 0 ahead with no unique files, so useful picker behavior appears already merged or superseded by current main.

## Validation Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Report includes all four requested branches. | PASS | Four branch sections are present. |
| Report includes recommended action for each branch. | PASS | Each branch section has `Recommended Action`. |
| Behind/ahead counts included. | PASS | Executive summary and each branch section include counts. |
| Commits not in main included. | PASS | Each branch section includes `git log main..origin/<branch>` output or `(none)`. |
| Changed files not in main included. | PASS | Each branch section includes `git diff --name-status main...origin/<branch>` output or `(none)`. |
| Diff stat included. | PASS | Each branch section includes `git diff --stat main...origin/<branch>` output or `(no diff)`. |
| No branches deleted. | PASS | No delete command was run. |
| No branches merged. | PASS | No merge command was run. |
| No branches cherry-picked. | PASS | No cherry-pick command was run. |
| Playwright impacted: No. | PASS | Report-only branch review; no runtime/UI behavior changed. |
| Full samples validation skipped. | PASS | Report-only branch review; no samples or runtime behavior changed. |
