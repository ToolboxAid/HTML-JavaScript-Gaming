# PR_26124_044-accordionv2-theme-extract

```bash
npx @openai/codex run --model gpt-5.5 --reasoning high "Run full workflow for PR_26124_044-accordionv2-theme-extract. Follow PROJECT_INSTRUCTIONS.md exactly. Move the working accordionV2 implementation from palette-manager-v2 into src/engine/theme/accordionV2 and update palette-manager-v2 to use the shared accordionV2 without behavior changes."
```

## Validation Commands

```bash
node --check src/engine/theme/accordionV2/accordionV2.js
node --check tools/palette-manager-v2/modules/PaletteManagerApp.js
npm run test:workspace-v2
```

## Manual Validation

- Open `tools/palette-manager-v2/index.html`.
- Confirm User Palette and Add User Swatch use shared `.accordion-v2` classes.
- Confirm both open panels share center height.
- Collapse either panel and confirm the other fills available center height.
- Confirm source select, search, sort, size, pin, and unpin still work.
