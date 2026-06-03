# PR 11.27 — Baseline 4dc2b0f and Enable Workspace Tool Buttons

## Purpose
Restart the recovery lane from the last known good Workspace Manager baseline:

4dc2b0f: Show Workspace Manager asset status from embedded tool payloads - PR 11.22

## Known Good at Baseline
- Sample 1902 loads JSON.
- Workspace Manager displays the correct full workspace.
- Embedded payload status is visible.

## Remaining Defect
- Many Workspace Manager tool buttons are grayed out/disabled even though their embedded payload data exists.

## Required Change
Start from commit `4dc2b0f` and make the smallest targeted fix so workspace-supported tools with embedded payload data are enabled/openable.

## Scope
- Use `4dc2b0f` as the baseline.
- Do not include today’s failed PR 11.23 / 11.24 / 11.25 forward-fix logic.
- Do not collapse workspace display to palette-only.
- Do not remove or rewrite JSON payload.
- Do not change schema unless a local enablement defect is proven.
- Do not add fallback sample data.
- Do not use hidden defaults.
- Do not touch start_of_day folders.
- Keep sample 1902 focused on Workspace Manager behavior.

## Key Rule
payload = data present

Enablement must not require:
- selectedAssetId
- assetRegistry
- external file reference

Those may be useful metadata, but they are not required for enabling a tool when embedded payload exists.

## Investigation Targets
Check button disabled logic in Workspace Manager/platform shell:
- Does it require an external asset reference?
- Does it require selectedAssetId?
- Does it treat embedded payload-only tools as missing assets?
- Does it mark true utility tools differently from payload-backed editor tools?
- Does status display and open enablement use different rules?

## Acceptance
- Workspace Manager from sample 1902 still shows the full workspace, not palette-only.
- Tools with embedded payload data are enabled/openable.
- Buttons are not grayed out solely because data is embedded instead of external.
- True unsupported/missing tools may remain disabled only with documented reason.
- Asset/status labels continue to show from embedded payload.
- Runtime smoke test passes.
