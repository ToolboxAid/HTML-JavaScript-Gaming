# Tool Template Cleanup

Task: PR_26152_277-tool-template-cleanup

## Scope Completed

- Updated `dev/templates/tool-template-v2.html`.
- Changed `<base href="../../GameFoundryStudio/">` to `<base href="/GameFoundryStudio/">`.
- Renamed visible page title and header text from `AI Assistant` to `Tool Template`.
- Replaced AI Assistant-specific visible copy with reusable Toolbox tool template copy.
- Preserved the existing left/center/right workspace structure.
- Preserved the existing ToolDisplayMode host element and behavior.
- Did not add or modify CSS.
- Did not change functionality.

## Text Updates

- `<title>` is now `Tool Template - Game Foundry Studio`.
- Page kicker is now `Toolbox Template`.
- Page heading is now `Tool Template`.
- Lede now describes the page as a reusable Toolbox tool template.
- Setup, Workspace, and Output panel copy now describe reusable template areas.

## Path Updates

- `dev/templates/tool-template-v2.html`: `<base href="../../GameFoundryStudio/">` changed to `<base href="/GameFoundryStudio/">`.
- The final base path keeps existing relative CSS, JS, image, and partial references resolving under `/GameFoundryStudio/assets/...` when the repo root is served by a local dev server.

## Intentional Non-Changes

- `data-tool-slug="ai-assistant"` and `data-tool-icon-src="assets/images/badges/ai-assistant.png"` were left unchanged because they are non-visible ToolDisplayMode asset hooks and no generic template badge or character asset exists in the shared image folders. Changing the slug would point ToolDisplayMode at missing template images.

## Validation

- Required validation: `git diff --check`
