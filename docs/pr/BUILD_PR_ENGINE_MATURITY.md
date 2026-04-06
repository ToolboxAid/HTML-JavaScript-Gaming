# BUILD_PR_ENGINE_MATURITY

## Purpose
Build a docs-first, implementation-ready bundle for final engine maturity work focused on migration and stabilization only.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Build Scope
- promote only proven public debug surfaces
- lock stable debug API seams
- define plugin lifecycle boundaries
- define versioned contract metadata
- define external documentation ownership
- define benchmark entry points and benchmark rules

## Hard Constraints
- no new features
- no engine-core API pollution
- no unrelated refactors
- preserve `docs/pr` history
- roadmap edits must be bracket-state-only

## Stable Debug API Seams (authoritative)
1. Command seams:
- command registration
- command discovery/help metadata
- command execution contract (status/title/lines/code/details)

2. Panel seams:
- panel descriptor registration
- panel identity/priority/enabled metadata
- panel render contract (summary-level output)

3. Provider seams:
- provider registration and read-only snapshot access
- deterministic snapshot shape guidance

4. Runtime debug control seams:
- console/overlay visibility toggles
- deterministic debug render ordering hooks

## Plugin Lifecycle Boundaries
Lifecycle phases:
1. `register(context)`
2. `enable(context)`
3. `disable(context)`
4. `dispose(context)`

Boundary rules:
- plugins consume public seams only
- no direct private-state mutation
- failures must be isolated and non-fatal
- plugin capability scope must be explicit

## Versioned Contract Metadata
Required metadata fields for promoted contracts:
- `contractId`
- `contractVersion`
- `compatibility` (`backwardCompatible` boolean + notes)
- `status` (`active|deprecated`)
- `deprecatedSince` (optional)
- `replacementContractId` (optional)

Version policy:
- MAJOR: breaking changes
- MINOR: additive/backward-compatible changes
- PATCH: non-breaking fixes/clarifications

## External Documentation Ownership
Ownership split:
- `docs/pr/`: PR-specific intent/history
- `docs/dev/`: active control docs + operational references
- external-facing maturity references remain canonical in dedicated `docs/dev/ENGINE_MATURITY_*` docs until promoted to long-lived architecture docs

Canonicality rule:
- one authoritative source per concern
- cross-link, do not duplicate normative rules

## Performance Benchmark Entry Points And Rules
Entry points:
- console command execution latency
- overlay render/update cost
- provider polling/update overhead
- panel toggle/open/close cost
- preset apply/reset cost

Rules:
- benchmark both debug-disabled and debug-enabled modes
- measure cold-open vs steady-state
- record environment/sample/scenario metadata
- treat repeated regressions as maturity blockers

## Apply Handoff
`APPLY_PR_ENGINE_MATURITY` should:
- implement only approved seams and boundaries
- preserve behavior parity
- keep changes surgical and reversible
- keep project/sample-specific adapters outside shared engine-debug

## Validation Checklist
- stable seams documented and bounded
- plugin lifecycle boundaries explicit
- contract metadata schema defined
- docs ownership explicit
- benchmark entry points/rules explicit
- no feature expansion in this bundle
