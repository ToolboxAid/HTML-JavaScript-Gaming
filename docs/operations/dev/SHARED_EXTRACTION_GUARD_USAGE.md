# SHARED_EXTRACTION_GUARD_USAGE

## Run
- `node tools/dev/checkSharedExtractionGuard.mjs`
- `npm run check:shared-extraction-guard` (if present)
- `./tools/dev/runSharedExtractionGuard.sh`

## What It Checks
- duplicate helpers (`asFiniteNumber`, `asPositiveInteger`, `isPlainObject`)
- bad shared imports (fragile relative shared paths)
- alias usage (`@shared/`)

## What Failure Means
- One or more files violate shared-extraction guard rules and must be corrected before proceeding.

## Fix Violations
- remove local duplicate helper definitions
- replace disallowed shared import paths with approved paths
- remove `@shared/` alias imports and use approved relative imports
