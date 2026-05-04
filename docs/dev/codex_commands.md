# Codex Commands - PR_26124_071-palette-manager-remove-tools-shared-shell

```bash
npx @openai/codex run --model gpt-5.5 --reasoning high "Run full workflow for PR_26124_071-palette-manager-remove-tools-shared-shell. Follow PROJECT_INSTRUCTIONS.md exactly."
```

## Validation Commands

```bash
node --check tools/palette-manager-v2/paletteManagerShell.js
node --check tools/palette-manager-v2/main.js
node --input-type=module <tools/shared shell dependency validation>
node --input-type=module <css structural validation>
node --input-type=module <targeted Palette Manager local shell Playwright validation>
node tests/tools/ToolLayoutDockingControlNormalization.test.mjs
node tests/tools/ToolEntryLaunchContract.test.mjs
git diff --check -- tools/palette-manager-v2/index.html tools/palette-manager-v2/paletteManagerV2.css tools/palette-manager-v2/paletteManagerShell.js
npm run test:workspace-v2
```

## Playwright

Targeted Palette Manager V2 local shell Playwright validation passed. It confirmed the page no longer loads `platformShell` assets, local header/status render, hide/show summary behavior works, Palette Manager controls render, and menuSample actions remain centered.

`npm run test:workspace-v2` was also requested as the default gate. It failed because `package.json` does not define the `test:workspace-v2` script.

## Full Samples

Full samples smoke test was skipped by instruction.
