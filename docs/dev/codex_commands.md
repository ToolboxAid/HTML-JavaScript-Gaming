# PR_26124_043-palette-manager-accordion-v2

```bash
npx @openai/codex run --model gpt-5.5 --reasoning high "Run full workflow for PR_26124_043-palette-manager-accordion-v2. Follow PROJECT_INSTRUCTIONS.md exactly. Rewrite only palette-manager-v2 center accordion HTML/JS/CSS to use a local accordionV2 structure instead of details/summary."
```

## Validation Commands

```bash
node --check tools/palette-manager-v2/modules/PaletteManagerApp.js
npm run test:workspace-v2
```

## Manual Validation

- Open `tools/palette-manager-v2/index.html`.
- Confirm User Palette and Add User Swatch use accordionV2 button headers.
- Confirm both open panels share center height.
- Collapse either panel and confirm the other fills available center height.
- Confirm source select, search, sort, size, pin, and unpin still work.
