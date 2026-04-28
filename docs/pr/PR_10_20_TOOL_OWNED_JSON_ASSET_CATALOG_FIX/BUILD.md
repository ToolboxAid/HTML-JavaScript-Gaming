# BUILD_PR_10_20_TOOL_OWNED_JSON_ASSET_CATALOG_FIX

## Required Codex Work

### 1. Remove competing registry bridge for 0204
Current uploaded evidence shows:
- `sample.0204.asset-browser.json` already contains `config.assetCatalog.entries`
- `AssetRegistryScene.js` still constructs an `AssetRegistry` and registers `options.assets`
- `assetRegistry.js` re-exports engine registry

For 0204:
- remove or stop using sample-local `assetRegistry.js` and `AssetRegistryScene.js` as a source/bridge for tool data
- ensure Asset Browser / Import Hub uses `sample.0204.asset-browser.json` directly
- do not let runtime scene state overwrite the tool catalog

### 2. Normalize JSON for 0204, 1413, 1505
For each sample:
- inspect its asset-browser/import-hub JSON
- ensure the full asset list is in the schema-compatible JSON location the tool expects
- if the tool expects one canonical key, make all three samples use that key consistently
- remove duplicated or competing preset-only data that can overwrite the catalog
- preserve valid preset fields only as UI state, not asset source

### 3. Fix flash-then-blank
Identify the later loader/state pass that clears or truncates catalog entries after initial render.
Fix the smallest cause, such as:
- preset application replacing catalog
- selected category/search filtering all entries after initial load
- schema normalizer dropping entries
- second async load replacing input with empty state
- Import Hub mapping only first entry

### 4. Tool ownership rule
Asset Browser / Import Hub must:
- read JSON directly
- write/export JSON directly
- not depend on sample scene classes
- not scrape JS files
- not load hidden defaults

### 5. Validation report
Create:
docs/dev/reports/PR_10_20_TOOL_OWNED_JSON_ASSET_CATALOG_FIX_report.md

Report must include:
- changed files grouped by sample/tool
- root cause of flash-then-blank
- final JSON source file for each sample
- asset counts before/after for 0204, 1413, 1505
- confirmation 0204 no longer uses `assetRegistry.js` / `AssetRegistryScene.js` for tool data
- confirmation no fallback/default data and no start_of_day changes

## Constraints
- One PR purpose only: tool-owned JSON asset catalog loading.
- Smallest scoped valid change.
- No broad engine refactor.
- No unrelated UI polish.
