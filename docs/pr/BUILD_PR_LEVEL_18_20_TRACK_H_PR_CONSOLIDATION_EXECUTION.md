# BUILD_PR_LEVEL_18_20_TRACK_H_PR_CONSOLIDATION_EXECUTION

## Purpose
Execute Track H (PR Consolidation Strategy) as real repo work by consolidating fragmented PR review surfaces into capability-level review units and adding enforceable repo-side guidance so future PRs are packaged as complete capabilities.

## Roadmap intent
This PR may advance the following Track H items only if fully executed and validated:
- `bundle related PRs into capability-level units` `[ ] -> [x]`
- `reduce multi-PR fragmentation` `[ ] -> [x]`
- `ensure each PR represents a complete capability` `[ ] -> [x]`
- parent `Track H - PR Consolidation Strategy` `[ ] -> [x]`

## Scope
Included:
- audit fragmented PR/doc capability history in `docs/pr/`
- identify related PR clusters that should be reviewed as one capability
- create capability-level consolidation docs/indexes so reviewers can consume one capability from one place
- add repo-side PR packaging guidance/checklist that enforces complete-capability PRs going forward
- normalize active PR guidance references to point at capability-level units
- produce validation reports
- preserve unrelated working-tree changes

Excluded:
- no implementation/runtime feature work
- no engine/shared/game/tool behavior changes
- no Track 20 work
- no roadmap text rewrites
- no deletion of roadmap content
- no `start_of_day` modifications
- no broad doc cleanup outside PR-consolidation purpose

## Hard guards
- one PR purpose only: complete Track H
- docs-first
- execution-backed only
- no commit-only packaging
- any deleted or superseded PR doc must be replaced by authoritative capability-level review surfaces
- preserve historical traceability: old PR identifiers must remain discoverable through index/mapping docs even if review is consolidated
- roadmap changes must be status-only and only after validation

## Required outputs
Codex must create/update:
- `docs/dev/reports/BUILD_PR_LEVEL_18_20_TRACK_H_PR_CONSOLIDATION_EXECUTION_FRAGMENTATION_AUDIT.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_20_TRACK_H_PR_CONSOLIDATION_EXECUTION_CAPABILITY_GROUPS.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_20_TRACK_H_PR_CONSOLIDATION_EXECUTION_CONSOLIDATION_MAP.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_20_TRACK_H_PR_CONSOLIDATION_EXECUTION_VALIDATION.md`
- `docs/dev/templates/pr_capability_bundle_checklist.md`

Capability review surfaces to create/update as needed:
- `docs/pr/capabilities/`...
- or another clearly named capability-level folder under `docs/pr/`

## Execution details

### 1) Fragmentation audit
Audit `docs/pr/` and identify clusters where one capability is split across many small PR docs.
For each cluster, record:
- capability name
- related PR docs
- why the cluster is fragmented
- recommended authoritative review doc

### 2) Capability-level consolidation
For each fragmented cluster selected in this PR:
- create one authoritative capability review doc
- summarize what the capability does, current status, linked artifacts, and validation path
- preserve traceability back to original PR docs
- reduce reviewer need to open many PR docs to understand one capability

### 3) Future enforcement guidance
Create/update a reusable checklist/template that future PR bundles must satisfy:
- one complete capability per PR where possible
- avoid fragmented partial-review PRs
- include execution + validation + roadmap advancement expectations
- preserve ZIP workflow and docs-first rules

### 4) Reference normalization
Where active repo instructions or PR navigation docs point to fragmented review surfaces, update those pointers to the new capability-level authoritative surfaces.

## Acceptance
- fragmented PR clusters are audited and documented
- capability-level authoritative review docs exist for fragmented clusters addressed by this PR
- reviewers can navigate one capability from one authoritative surface
- future PR packaging guidance exists and is explicit
- traceability from original PR docs to consolidated capability docs is preserved
- roadmap updates are status-only and execution-backed
- Track H is complete only if all three Track H items are validated

## Validation requirements
Validation must confirm:
- number of fragmented clusters found
- number of capability-level authoritative docs created/updated
- original PR traceability preserved
- active navigation pointers updated where applicable
- no `start_of_day` changes
- unrelated working-tree changes preserved
- roadmap edits are limited to Track H status-only transitions

## Roadmap update rules
Only update status markers in the current repo roadmap file.

Allowed transitions only if fully executed and validated:
- `bundle related PRs into capability-level units` `[ ] -> [x]`
- `reduce multi-PR fragmentation` `[ ] -> [x]`
- `ensure each PR represents a complete capability` `[ ] -> [x]`
- parent `Track H - PR Consolidation Strategy` `[ ] -> [x]`

Do not change Track 20 in this PR.
