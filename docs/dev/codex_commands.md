MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply PR 11.37.

Perform a deep rename:
Vector Asset Studio -> SVG Asset Studio

This is not display-only. Rename directories, files, ids, usage, schema references, JSON payloads, docs, tests, imports, launch URLs, registry entries, and Workspace Manager references as needed.

Canonical new identity:
- display name: SVG Asset Studio
- internal/tool id: svg-asset-studio
- purpose: SVG-focused asset authoring studio

Old identity:
- display name: Vector Asset Studio
- old id likely: vector-asset-studio

Compatibility:
- Provide one centralized temporary alias:
  vector-asset-studio -> svg-asset-studio
- The alias must be documented.
- Do not scatter remapping logic across files.
- Do not create duplicate tool entries.
- Do not keep both tools visible.
- Do not create pass-through variable chains.
- Do not add hidden/default fallback data.

Required work:
1. Inspect actual current repo for all references:
   - "Vector Asset Studio"
   - "vector-asset-studio"
   - "vectorAssetStudio"
   - "vector asset studio"
   - related path names
2. Rename active tool directory/file names where feasible.
3. Update imports and references.
4. Update tool manifest/registry/schema entries.
5. Update sample 1902 workspace JSON/payload references.
6. Update docs/help text that users see.
7. Update tests/smoke expectations.
8. Keep old references only in:
   - one compatibility alias location
   - migration/report docs
9. Validate no duplicate SVG/Vector Asset Studio tiles appear.

Do NOT:
- change unrelated tool behavior
- modify Vector Map Editor except where it references the renamed tool
- modify payload behavior except ID/name migration
- touch start_of_day folders unless required by active runtime validation
- leave mixed canonical naming

Validation:
Run:
node --check tools/shared/platformShell.js
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools

Also run repo search checks and include results in report:
- search for "Vector Asset Studio"
- search for "vector-asset-studio"
- search for "SVG Asset Studio"
- search for "svg-asset-studio"

Manual validation:
Open sample 1902 -> Workspace Manager.
Confirm:
- one tile only: SVG Asset Studio
- no Vector Asset Studio tile
- SVG Asset Studio opens
- Vector Map Editor still opens
- workspace payload still loads correctly

REPORT:
Write docs/dev/reports/PR_11_37_deep_rename_validation.txt with:
- files renamed
- files edited
- canonical new IDs/names
- compatibility alias location
- remaining old-name references and why each is allowed
- validation command results
- manual validation notes
