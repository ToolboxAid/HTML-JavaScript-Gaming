# PR_26152_042 Root First Tool Page Migration Validation

## Scope

- Migrated the first approved individual tool page to root:
  - `/tools/ai-assistant.html`
- Removed the legacy page:
  - `GameFoundryStudio/tools/ai-assistant.html`
- Chose AI Assistant because it is a low-risk informational tool page with only shared partial and Tool Display Mode dependencies.
- Updated the root Tools index data so the AI Assistant tile opens the migrated root page.
- Updated shared partial routing so the AI Assistant nav route resolves as a root route.
- Left all other individual tool pages unmigrated.
- Did not add CSS.
- Did not change tool runtime behavior.

## Changed Files

- `tools/ai-assistant.html`
- `GameFoundryStudio/tools/ai-assistant.html`
- `GameFoundryStudio/assets/js/tools-page-accordions.js`
- `GameFoundryStudio/assets/js/gamefoundry-partials.js`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/root_first_tool_page_migration_validation.md`

## Validation Commands

- PASS: `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js; node --check GameFoundryStudio/assets/js/tools-page-accordions.js; node --check GameFoundryStudio/assets/js/tool-display-mode.js`
  - Shared partial router, Tools index renderer, and Tool Display Mode scripts are syntactically valid.
- PASS: `rg -n --pcre2 "<script(?![^>]*\bsrc=)|<style|\son[a-z]+\s*=" tools/index.html tools/ai-assistant.html`
  - No inline script blocks, style blocks, or inline event handlers found.
- PASS: `rg -n "ai-assistant|assets/css/theme/v2/theme\.css|assets/js/gamefoundry-partials\.js|assets/js/tool-display-mode\.js|data-tool-display-mode|assets/images/tools/ai-assistant\.png|assets/images/badges/ai-assistant\.png|\.\./tools/ai-assistant\.html|rootPageRoutes" tools/ai-assistant.html tools/index.html GameFoundryStudio/assets/js/tools-page-accordions.js GameFoundryStudio/assets/js/gamefoundry-partials.js`
  - Migrated page loads Theme V2, shared partial JS, and Tool Display Mode JS.
  - Migrated page declares root-safe Tool Display Mode asset paths.
  - Tools index data points the AI Assistant tile to root `/tools/ai-assistant.html`.
  - Shared partial router treats AI Assistant as a root route.
- PASS: `rg --files | rg "ai-assistant"`
  - Root migrated page exists.
  - AI Assistant tool image, icon, badge, and character assets exist.
- PASS: `rg -n "assets/images/tools/ai-assistant\.png|assets/images/badges/ai-assistant\.png|assets/images/characters/ai-assistant\.png" GameFoundryStudio/assets/js/tool-display-mode.js tools/ai-assistant.html GameFoundryStudio/assets/js/tools-page-accordions.js`
  - Root page and supporting data reference the AI Assistant image and badge paths.
  - Character path is produced by Tool Display Mode from `data-asset-root="assets/images"` and `data-tool-slug="ai-assistant"`.
- PASS: `git status --short -- tools/ai-assistant.html GameFoundryStudio/tools/ai-assistant.html tools/index.html GameFoundryStudio/assets/js/tools-page-accordions.js GameFoundryStudio/assets/js/gamefoundry-partials.js GameFoundryStudio/assets/js/tool-display-mode.js GameFoundryStudio/assets/css/theme/v2 docs_build/dev/commit_comment.txt docs_build/dev/reports/codex_review.diff docs_build/dev/reports/codex_changed_files.txt docs_build/dev/reports/root_first_tool_page_migration_validation.md`
  - Scoped status shows the root AI Assistant page addition, old in-folder AI Assistant deletion, and expected supporting JS/report updates.

## Link Validation

- Root Tools index data now uses:
  - `../tools/ai-assistant.html`
- From `/tools/index.html` with `<base href="../GameFoundryStudio/">`, that link resolves to root `/tools/ai-assistant.html`.
- Shared partial route map still maps:
  - `ai-assistant` -> `tools/ai-assistant.html`
- `ai-assistant` is included in `rootPageRoutes`, so shared nav rewrites that route to root `/tools/ai-assistant.html` from migrated root pages.

## Asset and JS Validation

- `tools/ai-assistant.html` loads:
  - `assets/css/theme/v2/theme.css`
  - `assets/js/gamefoundry-partials.js`
  - `assets/js/tool-display-mode.js`
- `tools/ai-assistant.html` references:
  - `assets/images/tools/ai-assistant.png`
  - `assets/images/badges/ai-assistant.png`
  - Tool Display Mode character path: `assets/images/characters/ai-assistant.png`

## Skipped

- Repo-wide tests were not run by request.
- Tests outside the root Tools index and migrated AI Assistant page were not run by request.
- Full samples smoke test was not run by request.
- Individual runtime validation for all other tool pages was not run by request.
- Several simple `Test-Path` probes were retried but intermittently blocked by the Windows sandbox with:
  - `windows sandbox: spawn setup refresh`
