# Codex Commands — PR_11_192

## Model
GPT-5.4

## Reasoning
high

## Command
codex exec --model gpt-5.4 --reasoning high "Apply PR_11_192 exactly as documented in docs/pr/PR_11_192_v2_html_shell_correction.md. Correct V2 tools so index.html owns the static shell, CSS links, shared header mount, page layout, menuTool/menuWorkspace containers, and module script. Keep index.js behavior-only: title/tool id setup, session read, validation, DOM population, rendering, and empty/error states. Do not inject CSS or replace document.body.innerHTML from JS. Do not touch schemas, samples, games, Workspace Manager v1, platformShell, tools/shared, or legacy tools. Return a ZIP at tmp/PR_11_192_20260501_01.zip."

## Targeted validation
node --check tools/palette-manager-v2/index.js
node --check tools/svg-asset-studio-v2/index.js
node --check tools/vector-map-editor-v2/index.js

Skip any validation command only if the file does not exist and document why in docs/dev/reports/PR_11_192_validation.md.

## Manual validation
Open each corrected V2 tool directly and verify:
- shared header renders from `<div id="shared-theme-header"></div>`
- static page shell is visible before session data
- empty session shows explicit empty state
- valid session renders without legacy coupling
