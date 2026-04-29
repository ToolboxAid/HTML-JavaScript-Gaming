# PR 11.77 — Engine Utils Import Rewire

## Purpose
Repair the import fallout from moving utility files from `src/shared/utils/*` to `src/shared/utils/*`.

The current known failure is:

```text
FixedTicker.js:7 GET http://127.0.0.1:5500/src/shared/utils/invariant.js net::ERR_ABORTED 404 (Not Found)
```

This means source files still import utilities from the old engine path after the files were moved.

## Scope
- Search the repo for every source reference to `src/engine/utils` and `engine/utils` import paths.
- Rewrite those imports to the correct `src/shared/utils` / `shared/utils` relative paths.
- Verify `FixedTicker.js` no longer references `src/shared/utils/invariant.js`.
- Verify no source file still imports from `src/shared/utils/*` for files that were moved to shared.
- Do not move more files in this PR.
- Do not add wrappers, aliases, or compatibility shim files.
- Do not restore `src/shared/utils/invariant.js` as a pass-through file.

## Acceptance
- No browser 404 for `/src/shared/utils/invariant.js`.
- No source imports remain pointing to moved utility files under `src/shared/utils/*`.
- Imports resolve directly to `src/shared/utils/*`.
- Workspace Manager loads.
- Affected runtime entry opens without module import errors.

## Targeted validation
Run targeted checks only:

```powershell
Select-String -Path .\src\*.js,.\src\**\*.js,.\samples\*.js,.\samples\**\*.js,.\games\*.js,.\games\**\*.js -Pattern "engine/utils"
Select-String -Path .\src\*.js,.\src\**\*.js,.\samples\*.js,.\samples\**\*.js,.\games\*.js,.\games\**\*.js -Pattern "src/engine/utils"
```

Then open the previously failing page and confirm the console no longer reports:

```text
/src/shared/utils/invariant.js 404
```

## Full suite
Do not run the full samples smoke suite unless import rewiring touches shared loader/framework behavior broadly.
