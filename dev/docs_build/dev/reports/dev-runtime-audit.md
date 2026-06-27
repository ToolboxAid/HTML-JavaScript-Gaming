# Dev Runtime Audit

## Scope

PR_26158_039 audited active mock, seed, guest, fixture, demo, dev-only, and local-only runtime code that could be imported by browser/tool surfaces or packaged into non-local deployments.

The audit focused on:

- Active browser/tool roots: `account`, `admin`, `assets`, `toolbox`, `src/engine`, and `src/shared`
- Dev-runtime persistence and seed ownership
- Local Mem/Local DB seed and reseed paths
- Mock repository file placement
- UAT/PROD import boundary candidates

## Files Moved Into `src/dev-runtime`

| Previous Path | New Path | Status |
| --- | --- | --- |
| `toolbox/assets/assets-mock-repository.js` | `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` | PASS |
| `toolbox/colors/palette-workspace-repository.js` | `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js` | PASS |
| `toolbox/colors/palette-source-mock-db.js` | `src/dev-runtime/guest-seeds/palette-source-mock-db.js` | PASS |
| `toolbox/game-configuration/game-configuration-mock-repository.js` | `src/dev-runtime/persistence/tool-repositories/game-configuration-mock-repository.js` | PASS |
| `toolbox/game-design/game-design-mock-repository.js` | `src/dev-runtime/persistence/tool-repositories/game-design-mock-repository.js` | PASS |
| `toolbox/project-journey/project-journey-mock-repository.js` | `src/dev-runtime/persistence/tool-repositories/project-journey-mock-repository.js` | PASS |
| `toolbox/project-workspace/project-workspace-mock-repository.js` | `src/dev-runtime/persistence/tool-repositories/project-workspace-mock-repository.js` | PASS |

## New Dev-Runtime Seed Ownership

| Area | File | Status |
| --- | --- | --- |
| Palette source seed rows | `src/dev-runtime/guest-seeds/palette-source-mock-db.js` | PASS |
| Local Mem guest/user tool-state sample seed rows | `src/dev-runtime/guest-seeds/tool-state-samples.js` | PASS |
| Local Mem/Local DB persistence and reseed store | `src/dev-runtime/persistence/mock-db-store.js` | PRESERVED |
| SQLite Local DB adapter | `src/dev-runtime/persistence/local-db-adapter.mjs` | PRESERVED |

## Import Boundary Results

| Check | Evidence | Result |
| --- | --- | --- |
| Active browser/tool roots do not import `src/dev-runtime`. | `rg` over `account admin assets toolbox src`, excluding `src/dev-runtime`, returned no matches. | PASS |
| Active browser/tool roots do not import moved mock repositories. | `rg` for mock repository imports outside `src/dev-runtime` returned no matches. | PASS |
| Server router imports moved repositories only through dev-runtime paths. | `src/dev-runtime/server/mock-api-router.mjs` imports from `../persistence/tool-repositories/*`. | PASS |
| Tests may import dev-runtime repositories for direct validation. | Repository-focused Playwright specs import from `src/dev-runtime/persistence/tool-repositories/*`. | PASS |
| Retired toolbox mock repository files are absent. | `tests/dev-runtime/DevRuntimeBoundary.test.mjs` asserts old toolbox paths do not exist. | PASS |
| UAT/PROD candidate browser surfaces do not import dev-runtime. | `DevRuntimeBoundary.test.mjs` scans `account`, `admin`, `assets`, `src/engine`, `src/shared`, and `toolbox`. | PASS |

## Remaining Allowed Dev-Runtime Areas

| Path | Purpose | Audit Result |
| --- | --- | --- |
| `src/dev-runtime/auth/` | Local login/session implementation behind gateways. | ALLOWED |
| `src/dev-runtime/persistence/` | Local Mem/Local DB persistence, mock repositories, SQLite adapter. | ALLOWED |
| `src/dev-runtime/admin/` | Local admin DB Viewer implementation behind route shell. | ALLOWED |
| `src/dev-runtime/testing/` | Dev-runtime test support. | ALLOWED |
| `src/dev-runtime/guest-seeds/` | Guest and local seed data. | ALLOWED |
| `src/dev-runtime/server/` | Local API server boundary. | ALLOWED as API boundary, not browser data ownership |

## Remaining Violations

None found.

## Notes

- The static audit intentionally excludes `archive/v1-v2`, `docs_build/dev`, and `tmp`.
- Test files under `tests/**` import dev-runtime modules only for validation. They are not browser runtime code.
- `docs_build/dev/reports/project-workspace-mock-repository.md` is historical/report documentation and is not runtime code.
- Existing seed-only audit fallback diagnostics remain visible during validation. They are not new boundary violations and are still isolated under dev-runtime seed/bootstrap behavior.
