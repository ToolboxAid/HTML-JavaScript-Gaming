# BUILD_PR_STYLE_03_SAMPLES_INDEX_RESET

## Purpose
Apply the same clean, Toolbox Aid–derived style system to `/samples/index.html` using the established `/index.html` pattern.

## Scope
- Reset `/samples/index.html` to use shared theme only
- Use shared header (no duplication)
- No embedded CSS or JS styling
- Match `/index.html` structure closely

## Rules
- Do NOT reuse old classes/ids
- Do NOT inspect old styling as baseline
- Keep layout consistent with `/index.html`
- Use only theme files under `src/engine/theme/`

## Acceptance
- `/samples/index.html` visually aligns with `/index.html`
- No embedded styles exist
- Header loads from shared source
- Clean, testable page
