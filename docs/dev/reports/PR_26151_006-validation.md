# PR_26151_006-tools-page-accordion-count-sort-group Validation

## Scope

- Corrected Tools page accordion generation.
- Order mode flattens all tools into individual accordions sorted alphabetically.
- Grouped mode renders the existing tool grouping/category source as category accordions.
- Added an Order A-Z/Z-A display control and kept Grouped as a separate display control.
- Preserved existing vertical accordion classes and tool card patterns.
- Changed no CSS files.

## Validation Results

### Syntax / Static Checks

PASS:

```text
node --check GameFoundryStudio/assets/js/tools-page-accordions.js
```

Result: command completed with exit code 0.

PASS:

```text
rg -n --pcre2 "<style|<script(?![^>]+\\bsrc=)|\\son[a-z]+\\s*=" GameFoundryStudio/tools/index.html
```

Result: no matches. The changed HTML contains no inline style blocks, inline script blocks, or inline event handlers.

PASS:

```text
rg -n "getOrderedTools|getGroupedTools|data-tools-order|grouped" GameFoundryStudio/assets/js/tools-page-accordions.js GameFoundryStudio/tools/index.html
```

Result: confirmed:

- `data-tools-order="ascending"`
- `data-tools-sort="grouped"`
- `getOrderedTools`
- `getGroupedTools`

### Tools Page UI Validation

PASS by static/runtime wiring review:

- The Tools page render target is `data-tools-accordion-list`.
- Order mode renders one flat `tool-grid` containing all tools.
- Grouped mode renders one `details.vertical-accordion` per category.
- The first rendered accordion opens by default for each mode.
- Each accordion uses existing `vertical-accordion`, `accordion-body`, `tool-grid`, and `tool-card` classes.
- The page does not contain a static or generated `Toolbox` summary wrapper.

### Sorting / Grouping

PASS by source review:

- Order A-Z sorts all tools alphabetically by visible tool title into one flat grid.
- Order Z-A sorts all tools reverse-alphabetically by visible tool title into one flat grid.
- Grouped mode shows the existing grouping/category order:
  - Assets / Content
  - Building / Creation
  - Design / Animation
  - Media / Audio / Community
  - Technology / System
  - Settings and Admin

### Accordion Header Behavior

PASS by preservation:

- This PR did not modify accordion CSS.
- Existing corrected vertical accordion summary behavior remains in `gamefoundrystudio.css`.
- Existing side-panel accordion header behavior was not changed.

### CSS SSoT

PASS:

- No CSS files were changed in this PR.
- No size, font, spacing, style, or layout rules were added outside `controls.css`.
- No color overrides were added.

## Blocked Validation

The following commands were attempted but blocked by the sandbox with:

```text
windows sandbox: spawn setup refresh
```

Blocked commands:

```text
node -e "<targeted order/group validation script>"
npm run test:workspace-v2
git diff -- GameFoundryStudio/tools/index.html GameFoundryStudio/assets/js/tools-page-accordions.js
git diff --stat
Compress-Archive -Path <changed files> -DestinationPath tmp/PR_26151_006-tools-page-accordion-count-sort-group_delta_20260531.zip -Force
```

ZIP packaging note:

- The first packaging attempt included pre-cleanup of a same-name ZIP and was rejected by policy.
- A second unique-name packaging attempt avoided pre-cleanup and was blocked by `windows sandbox: spawn setup refresh`.

## Playwright Impact

Playwright impacted: Yes.

Reason: this PR changes Tools page runtime UI behavior.

Expected pass behavior:

- Tools page loads.
- Order A-Z renders all tools as one alphabetized flat grid.
- Order Z-A renders all tools as one reverse-alphabetized flat grid.
- Grouped renders category accordions containing the grouped tools.
- Tool cards continue to link to their existing tool pages.

Expected fail behavior:

- Order mode renders grouped category accordions or per-tool accordions.
- Grouped mode renders flattened alphabetical tool accordions.
- Sort/group controls do not change the rendered view.
- Existing tool links fail to resolve.

`npm run test:workspace-v2` was attempted and blocked by the sandbox error listed above.

## Samples Decision

SKIP: full samples smoke test was not run because this PR is scoped to the GameFoundryStudio Tools page and the user explicitly did not request broad samples validation.
