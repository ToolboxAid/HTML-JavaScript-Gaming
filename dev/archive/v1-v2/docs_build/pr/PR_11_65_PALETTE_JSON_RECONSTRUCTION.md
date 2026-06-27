# PR 11.65 — Palette JSON Reconstruction From Sample JS

## Purpose
Resolve the remaining palette-related sample JSON audit misses by reconstructing palette JSON files from palette/color data already present in the affected sample JavaScript files, then updating those sample JS files to reference the generated palette JSON.

## Scope
- Use the current audit report/counts as the source of truth.
- Target remaining `Missing reference` items that are palette-related only.
- Generate palette JSON from colors already present in affected sample JS files.
- Update affected sample JS files to reference the generated palette JSON.
- Preserve behavior and visual output.
- Include the audit script counts-only output change if not already present.

## Non-Scope
- Do not delete palette-related JSON merely because it is missing.
- Do not invent new palette colors.
- Do not refactor sample runtime, loaders, or registry systems.
- Do not modify sample 1902 unless the audit proves it is directly required and safe.
- Do not run the full sample suite.

## Required Codex Execution
1. Run:
   ```powershell
   .\scripts\PS\audit-sample-json-js-references.ps1
   ```
2. Open `docs_build/dev/reports/sample_json_js_reference_audit.csv`.
3. Identify remaining `Missing reference` rows that are palette-related.
4. For each affected palette-related sample:
   - inspect the corresponding sample JS file,
   - locate inline palette/color arrays, constants, maps, swatches, ramps, or palette-like config,
   - create or repair the expected palette JSON file using only those existing colors,
   - update sample JS to reference/load that palette JSON through the existing sample asset/manifest mechanism already used in the repo.
5. Do not create fallback/default hidden data.
6. Re-run the audit.
7. The final audit must show fewer missing references than the baseline, or document every remaining palette miss with a concrete blocker in `docs_build/dev/reports/pr_11_65_palette_reconstruction_report.md`.

## Acceptance
- Palette-related missing references are converted into real JSON assets where JS data already exists.
- Affected sample JS references the generated palette JSON.
- No silent fallback data is introduced.
- Audit output is counts-only after final counts, with no repeated YES/NO list.
- Targeted validation only; full sample smoke test is skipped with reason documented.
