# PR_26177_OWNER_057-game-journey-metrics-regression-recovery Validation Lane

Status: PASS

## Commands

```powershell
node --check src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs
node --check toolbox/tools-page-accordions.js
node --check tests/dev-runtime/GameJourneyCompletionMetricsStore.test.mjs
node --check tests/playwright/tools/GameJourneyTool.spec.mjs
```

Result: PASS

```powershell
node ./scripts/run-node-test-files.mjs tests/dev-runtime/GameJourneyCompletionMetricsStore.test.mjs tests/dev-runtime/GameJourneyCompletionMetricsMigration.test.mjs
```

Result: PASS, 2 targeted node test files passed

```powershell
npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs --project=playwright --workers=1 --reporter=line -g "Game Journey Local API persists completion metrics to Postgres|Toolbox renders Creator-safe Game Journey progress outage copy"
```

Result: PASS, 2 passed

```powershell
node -e "import('node:fs').then(async fs=>{const [{createGameJourneyCompletionMetricsStore}, {createGameJourneyCompletionMetricsPostgresClientStub}] = await Promise.all([import('./src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs'), import('./tests/helpers/gameJourneyCompletionMetricsPostgresClientStub.mjs')]); const legacy='tmp/local-api/game-journey-completion-metrics.sqlite'; if(!fs.existsSync(legacy)) throw new Error('Expected existing legacy SQLite file for regression proof'); const store=createGameJourneyCompletionMetricsStore({postgresClient:createGameJourneyCompletionMetricsPostgresClientStub()}); const metrics=await store.listMetrics(); if(store.legacyDbPath) throw new Error('Active store resolved a legacy path'); if(metrics.length!==14) throw new Error('Expected 14 active metrics'); console.log('PASS active Postgres metrics ignore existing retired legacy SQLite file');})"
```

Result: PASS

```powershell
rg -n "Game Journey completion metrics unavailable" src assets toolbox --glob "!**/*.map"
rg -n "game-journey-completion-metrics\.sqlite|GAMEFOUNDRY_GAME_JOURNEY_METRICS_DB_PATH|defaultLegacySqlitePath" src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs toolbox/tools-page-accordions.js assets/toolbox/game-journey/js/index.js
```

Result: PASS, no matches

```powershell
git diff --check
```

Result: PASS, line-ending warnings only
