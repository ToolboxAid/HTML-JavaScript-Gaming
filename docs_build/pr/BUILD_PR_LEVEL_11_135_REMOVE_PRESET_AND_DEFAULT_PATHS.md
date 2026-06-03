# BUILD_PR_LEVEL_11_135_REMOVE_PRESET_AND_DEFAULT_PATHS

## Purpose
Eliminate ALL remaining preset/default/fallback input paths so tools rely strictly on explicit JSON.

## STRICT SCOPE

ALLOWED FILES:
- routing files
- tool launch handlers

ALLOWED CHANGES:
- remove preset loading
- remove default data injection
- remove fallback logic

## RULE

Tool input must come ONLY from:
- payloadJson
- optional paletteJson

## REMOVE

- tryLoadPreset*
- buildPreset*
- defaultData*
- fallback*

## VALIDATION

- missing JSON must ERROR (not fallback)
- runtime assertions must pass

## REPORT

docs_build/dev/reports/preset_default_removal_11_135.txt:
- files changed
- preset paths removed
- fallback paths removed

## FAILURE

FAIL if any preset/default path remains
