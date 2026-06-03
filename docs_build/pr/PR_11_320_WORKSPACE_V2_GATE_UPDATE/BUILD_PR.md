# BUILD_PR_11_320

## Implementation
- Updated `package.json` scripts:
  - added `test:workspace-v2:playwright`:
    - `playwright test tests/ui/workspace-v2.asset-manager.spec.js`
  - kept `test:workspace-v2` gate entry:
    - `node ./scripts/run-workspace-v2-playwright-gate.mjs`
- Updated `scripts/run-workspace-v2-playwright-gate.mjs`:
  - executes installed Playwright command path via Node:
    - preferred: `process.execPath + process.env.npm_execpath run --silent test:workspace-v2:playwright`
    - fallback: local Playwright CLI path under `node_modules`
  - preserves:
    - streamed output
    - clear gate summary
    - non-zero exit on any failure condition

## Validation
- `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('package.json','utf8')); console.log('package.json parse: PASS');"`
- `node --check scripts/run-workspace-v2-playwright-gate.mjs`
- `npm run test:workspace-v2`
