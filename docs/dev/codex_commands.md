# PR_26124_045-palette-manager-hidden-header-wide-layout

```bash
npx @openai/codex run --model gpt-5.5 --reasoning high "Run full workflow for PR_26124_045-palette-manager-hidden-header-wide-layout. Follow PROJECT_INSTRUCTIONS.md exactly. Update only palette-manager-v2 layout behavior when the shared platform header/details area is hidden."
```

## Validation Commands

```bash
node --check src/engine/theme/accordionV2/accordionV2.js
node --check tools/palette-manager-v2/modules/PaletteManagerApp.js
npm run test:workspace-v2
```

## Manual Validation

- Open `tools/palette-manager-v2/index.html`.
- Confirm normal layout is unchanged.
- Click `Hide Header and Details`.
- Confirm left/right panels anchor to the viewport sides.
- Confirm center fills the space between them and uses available height.
- Confirm accordionV2 behavior remains unchanged.
