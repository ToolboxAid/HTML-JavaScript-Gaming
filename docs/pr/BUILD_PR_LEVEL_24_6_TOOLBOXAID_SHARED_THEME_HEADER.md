# BUILD_PR_LEVEL_24_6_TOOLBOXAID_SHARED_THEME_HEADER

## Purpose
Provide the shared Toolbox Aid header as real importable source under `src/engine/theme`.

## Required Shared Source
- `src/engine/theme/toolboxaid-header.template.html`
- `src/engine/theme/toolboxaid-header.css`
- `src/engine/theme/toolboxaid-header.js`
- `src/engine/theme/index.js`

## Menu
- Home
- Games
- Samples
- Tools

## Acceptance
- Other pages can import from `src/engine/theme/index.js`
- Raw header source file is present in the ZIP
- CSS is shared in one place
- No duplicated header copies across pages
