# BUILD_PR_LEVEL_11_98_STRICT_SCHEMA_VALIDATION_AND_USAGE_REVIEW

## Objective
Make schemas strict and force repo data/code to conform. Samples and games must be reviewed, not just tools.

## Inputs
- Current repo schemas under `tools/schemas/**` or equivalent schema folder.
- Uploaded schema set from this session.
- Current samples under `samples/**`.
- Current game manifests under `games/**`.

## Required work

### 1. Inventory schema looseness
Create `docs_build/dev/reports/schema_strictness_inventory.md` and `.csv` listing every schema object that allows unknown fields.

Report columns:
- schemaPath
- jsonPointer
- currentAdditionalProperties
- looseReason
- action

Flag all occurrences of:
- missing `additionalProperties`
- `additionalProperties: true`
- broad `jsonValue` use for repo-owned payloads
- untyped `object`
- unvalidated nested tool payloads

### 2. Tighten schema contracts
Update schemas so owned objects reject unknown fields.

Rules:
- Every defined object must explicitly set `additionalProperties: false` unless the object is intentionally a dictionary/map.
- Any dictionary/map must use `patternProperties` or `additionalProperties` with a typed schema.
- Flat asset maps must validate keys and entries.
- Do not allow arbitrary fields merely because a tool is experimental.

### 3. Asset-browser contract
Enforce flat asset map contract.

Required shape:
```json
"asset-browser": {
  "tool": "asset-browser",
  "version": "1",
  "payload": {
    "assetBrowserPreset": {}
  },
  "assets": {
    "image.sample1902.preview": {
      "path": "/samples/phase-19/1902/assets/images/preview.svg",
      "kind": "image",
      "source": "workspace-manager"
    }
  }
}
```

Asset ID pattern:
```text
^(image|audio|font|svg|data|other)\.[a-z0-9-]+\.[a-z0-9-]+(?:\.[a-z0-9-]+)*$
```

Asset entry rules:
- required: `path`, `kind`, `source`
- `kind` enum: `image`, `audio`, `font`, `svg`, `data`, `other`
- `source` enum should include current valid producers such as `workspace-manager`, `asset-browser`, `manifest`, and any existing producer used by repo data.
- `stretchOverride` is allowed only on image assets, especially `image.*.bezel`.
- `media` must not be accepted as a sibling or replacement contract unless an explicit legacy migration schema is created and named as legacy.

### 4. Workspace manifest nested validation
Update workspace manifest validation so each tool block is validated against that tool's schema.

Do not allow:
- duplicate aliases such as both `palette-browser` and `palette` for the same tool contract
- unknown tool keys unless they match an approved extension pattern and are validated
- `assetRegistry` duplicates that conflict with `asset-browser.assets`
- inconsistent asset IDs across tools

### 5. Review and repair samples
Validate all JSON under `samples/**` against the correct schema.

Must include sample 1902:
- ensure `sample.1902.workspace-all-tools.json` validates
- keep a single asset SSoT for asset-browser assets
- remove or normalize duplicate `sprite-editor.assetRegistry` entries if they duplicate the asset-browser SSoT
- fix `kind: other` where the asset is an image
- remove alias tool keys unless schema explicitly supports them
- normalize asset IDs to `kind.domain.name`

### 6. Review and repair games
Validate all JSON under `games/**` against the correct schema.

Must include Asteroids:
- `game.manifest.json` uses flat assets only
- `image.asteroids.bezel` points to `/games/Asteroids/assets/images/bezel.png`
- `image.asteroids.background` points to the approved background asset
- `font.asteroids.vector-battle` is present if the font is used
- no guessed bezel/background paths in code
- no `media`-only asset loading path remains unless formally migrated and schema-backed

### 7. Update code that consumes schemas
Search loaders/tools for old assumptions and update them.

Must check:
- workspace manager
- asset browser
- svg asset studio
- game manifest loader
- sample/tool launcher
- any schema validation utility

Required behavior:
- fail on invalid schema in CI mode
- show safe user-facing error for invalid local payloads
- no hidden defaults
- no fallback payload generation

### 8. Add validation scripts
Add or update scripts:
- `scripts/PS/validate-tool-schemas.ps1`
- `scripts/PS/validate-sample-json.ps1`
- `scripts/PS/validate-game-manifests.ps1`
- optional wrapper: `scripts/PS/validate-all-json-contracts.ps1`

Outputs:
- counts-first console output
- detailed CSV reports under `docs_build/dev/reports/`
- nonzero exit in CI mode on violations

### 9. Targeted validation
Run targeted validation only:
- schema validation scripts
- sample 1902 workspace load
- Asteroids manifest load
- SVG Asset Studio asset list visibility
- Workspace Manager tile/sample counts if touched

Do not run full samples suite unless a shared loader/framework change makes it necessary.

## Acceptance
- Unknown fields are rejected by schema.
- All schemas have explicit `additionalProperties` policy.
- All sample JSON validates or is reported with exact blockers.
- All game manifests validate or are reported with exact blockers.
- Sample 1902 validates against the strict workspace/tool schema set.
- Asset Browser and SVG Asset Studio can see listed assets.
- Asteroids still loads manifest assets.
- Reports are written to `docs_build/dev/reports/`.

## Commit comment
Tighten schemas and validate samples/games against strict tool contracts - PR 11.98
