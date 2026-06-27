# PR_26151_001-tool-badge-character-name-alignment Validation

## Scope

- Scope was limited to `GameFoundryStudio` and the required report files.
- No inline CSS, inline JavaScript, or inline event handlers were added.
- No replacement artwork was created.

## Changes Completed

- Updated shared Tool Display Mode header behavior in `GameFoundryStudio/assets/js/tool-display-mode.js`.
- Updated Tool Display Mode styling in `GameFoundryStudio/assets/css/gamefoundrystudio.css`.
- Non-fullscreen header layout:
  - badge
  - character
  - description
- Fullscreen header layout:
  - badge
  - tool name
- Asset lookup now uses suffix-free filenames only:
  - `assets/images/badges/<tool-name>.png`
  - `assets/images/characters/<tool-name>.png`
- The previous runtime fallback logic for suffixed filenames was removed.

## Blocked Changes

- Renaming badge files from `*-icon.png` to `*.png` was blocked by the sandbox.
- Renaming character files from `*-character.png` to `*.png` was blocked by the sandbox.
- Blocked command attempts included:
  - Node `fs.renameSync`
  - PowerShell `Move-Item`
  - PowerShell `Rename-Item`
  - `cmd ren`
  - `git mv`
- Error: `windows sandbox: spawn setup refresh`

## Validation Performed

Passed:

- `node --check GameFoundryStudio/assets/js/tool-display-mode.js`
- `rg -n "body\.tool-focus-mode \.tool-display-mode__fullscreen-name|displayMode\.open = false|displayMode\.open = true|tool-display-mode__description" GameFoundryStudio/assets/js/tool-display-mode.js GameFoundryStudio/assets/css/gamefoundrystudio.css`
  - Confirms normal and fullscreen display-state hooks are present.
- `rg -n -- "-icon|-character|setAsset|forge-bot\.png" GameFoundryStudio/assets/js/tool-display-mode.js`
  - Result: no matches.
- `rg --pcre2 -n '<style\b|<script(?![^>]*\bsrc=)|\son[a-zA-Z]+\s*=|\sstyle\s*=' GameFoundryStudio -g '*.html'`
  - Result: no matches.

Blocked:

- `npm run test:workspace-v2`
  - Blocked by `windows sandbox: spawn setup refresh`.
- `git diff`
  - Blocked by `windows sandbox: spawn setup refresh`.
- Asset rename validation remains blocked because the asset rename operation itself is blocked.

## Filename Validation

Current state:

- `GameFoundryStudio/assets/images/badges` still contains `*-icon.png` files.
- `GameFoundryStudio/assets/images/characters` still contains `*-character.png` files.

Expected after unblocked rename:

- `GameFoundryStudio/assets/images/badges/<tool-name>.png`
- `GameFoundryStudio/assets/images/characters/<tool-name>.png`

## UI Validation

Static validation:

- Non-fullscreen header CSS supports one-line badge, character, and description.
- Fullscreen header CSS shows the tool name beside the badge when `body.tool-focus-mode` is active.
- `tool-display-mode.js` closes the details body on fullscreen entry and reopens it on fullscreen exit.

Manual validation still needed after asset renames:

- Open a GameFoundryStudio tool page.
- Confirm non-fullscreen Tool Display Mode shows badge, character, and description on one line.
- Enter fullscreen by selecting the Tool Display Mode header.
- Confirm fullscreen Tool Display Mode shows badge and tool name on one line.
- Exit fullscreen.
- Confirm non-fullscreen Tool Display Mode returns to badge, character, and description.

## Playwright

Playwright impacted: Yes. This PR changes shared Tool Display Mode UI behavior.

- `npm run test:workspace-v2` was attempted because header behavior is UI/runtime behavior, but the command was blocked by `windows sandbox: spawn setup refresh`.

Full samples smoke test was not run.
