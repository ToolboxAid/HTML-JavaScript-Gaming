# Tool Template Baseline Copy

Task: PR_26152_276-tool-template-baseline-copy

## Scope Completed

- Renamed `toolbox/_tool_template-v2` to `toolbox/_tool_template-v2_deprecated`.
- Copied `toolbox/ai-assistant.html` to `dev/templates/tool-template-v2.html`.
- Copied no directly required companion files.
- Preserved the copied AI Assistant layout, left column, center panel, right column, and `toolDisplayMode` behavior.
- Did not add or modify CSS.
- Did not rebuild Storage Inspector.

## Baseline Source And Target

- Source page: `toolbox/ai-assistant.html`
- New template baseline: `dev/templates/tool-template-v2.html`
- Deprecated previous template package: `toolbox/_tool_template-v2_deprecated`

## Companion File Decision

No companion files were copied. The copied page only references shared GameFoundryStudio CSS, JavaScript, partials, and image assets, and those continue to resolve through the updated `<base>` path in `dev/templates/tool-template-v2.html`.

## Validation

- Required validation: `git diff --check`
