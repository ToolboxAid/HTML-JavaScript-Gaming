# BUILD_PR_11_80_DEAD_UTILS_AUDIT

## Codex task
Add a new script:

`scripts/PS/audit-dead-utils.ps1`

## Required behavior

Run from repo root:

```powershell
.\scripts\PS\audit-dead-utils.ps1
```

Default output must be counts-first:

```text
Dead utils audit complete.
Utility files scanned: X
Potential dead utility files: X
Remaining engine-utils path references: X
Report: docs_build/dev/reports/dead_utils_audit.csv
```

With details:

```powershell
.\scripts\PS\audit-dead-utils.ps1 -Details
```

Print candidate paths and stale reference paths after the summary.

With CI:

```powershell
.\scripts\PS\audit-dead-utils.ps1 -Ci
```

Exit non-zero if any stale `src/engine/utils/` or `/src/engine/utils/` references remain.
Do not fail CI for potential dead candidates yet; this PR is report-only for dead-code decisions.

## Scan rules

Utility roots:

- `src/shared/utils`
- `src/engine/utils` if it still exists

Source search roots/files:

- `src/**/*.js`
- `samples/**/*.js`
- `toolbox/**/*.js`
- `games/**/*.js`
- `*.html`, `**/*.html`
- `**/*.json`

Exclude:

- `.git`
- `node_modules`
- `docs_build/dev/reports`
- `tmp`
- generated ZIP/extract folders

For each utility file:

1. Determine basename, for example `invariant.js`.
2. Determine extensionless module name, for example `invariant`.
3. Search for import/path references containing:
   - `shared/utils/<basename>`
   - `shared/utils/<moduleName>`
   - `/src/shared/utils/<basename>`
   - `/src/shared/utils/<moduleName>`
   - old engine equivalents for reporting only
4. Record candidate when no references are found outside the utility file itself.

## CSV columns

Write:

- `Kind`
- `Path`
- `Reason`
- `ReferenceCount`
- `Recommendation`

Kinds:

- `PotentialDeadUtility`
- `RemainingEngineUtilsReference`
- `UtilityFile`

## Guardrails

- No deletes.
- No runtime import rewrites in this PR.
- No wrappers/shims.
- Keep script executable PowerShell only; no markdown/prose text inside the `.ps1` body except comments.
