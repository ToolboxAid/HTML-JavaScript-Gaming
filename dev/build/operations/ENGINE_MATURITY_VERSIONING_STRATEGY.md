# Engine Maturity Versioning Strategy

## Objective
Provide one reusable version-policy seam for mature debug/render contracts while preserving stable behavior for the current production contract version.

## Required Metadata
Each promoted contract should define:
- `contractId`
- `currentVersion`
- `supportedVersions`
- `deprecatedVersions`

## Runtime Rules
1. Normalize incoming version strings to canonical semver (`MAJOR.MINOR.PATCH`).
2. Accept only versions listed in `supportedVersions`.
3. Treat unsupported versions as hard validation failures.
4. Allow deprecation signaling without silent auto-upgrade.

## SemVer Guidance
- MAJOR: breaking contract changes
- MINOR: additive backward-compatible changes
- PATCH: non-breaking fixes/clarifications

## Compatibility Guidance
- Alias-style inputs (for example `v1.0`) may be normalized to a supported canonical version.
- Unsupported major upgrades (for example `2.x`) must be rejected explicitly.

## Current Adopted Policies
- Render contract (`toolbox.render.contract`): current `1.0.0`, supported `1.0.0` aliases normalized from `1`, `1.0`, `v1.0`.
- Dev diagnostics contract (`toolbox.dev.diagnostics`): current `1.0.0`, same compatibility normalization policy.

## Deprecation Rules
- Mark deprecations in policy metadata before removal.
- Keep replacement guidance in docs before advancing MAJOR.
- Remove deprecated versions only after explicit migration window closure.
