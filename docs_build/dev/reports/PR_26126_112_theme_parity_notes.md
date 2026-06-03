# PR_26126_112 Theme Parity Notes

## Workspace Manager V2 Theme Fix
- `tools/workspace-manager-v2/styles/workspaceManagerV2.css` now maps its local surface variables to the shared First-Class Tool V2 theme tokens:
  - `--bg-gradient`
  - `--panel`
  - `--surface-inline`
  - `--surface-border`
  - `--line`
  - `--text`
  - `--muted`
  - `--accent`
- Local green/teal hardcoded colors were removed from Workspace Manager V2 CSS.
- The local CSS retains native browser button system colors, matching the existing `tools/templates-v2` pattern.
- Workspace Manager V2 app shell, frame, panel, accordion, input, and status surfaces now resolve through the same token source used by Tool Template V2, Palette Manager V2, Preview Generator V2, and Asset Manager V2.

## First-Class Tool V2 Contract Check
- CSS import order remains:
  1. `../../src/engine/theme/main.css`
  2. `../../src/engine/ui/hubCommon.css`
  3. `../../src/engine/theme/accordionV2/accordionV2.css`
  4. `./styles/workspaceManagerV2.css`
- Body classes remain:
  - `tools-platform-tool-page`
  - `tools-platform-surface`
  - `hub-page-tools`
- Playwright validates the import order, body class usage, absence of local hardcoded CSS color literals, and computed style parity against shared tokens.

## Forward-Looking Theme Contract
- New first-class tools should import the same theme sources in the same order before local tool CSS.
- New first-class tools should use local CSS variables only as semantic aliases to approved shared theme tokens.
- New first-class tools should not introduce local color palettes, local gradients, local rgba surfaces, or local text colors unless a future PR explicitly adds the token to the shared theme source.
- Tool-local CSS may define layout, spacing, sizing, and component-specific structure, but color and surface values should resolve through shared theme tokens.
