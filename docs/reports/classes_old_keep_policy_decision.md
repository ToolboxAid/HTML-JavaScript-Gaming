# legacy class-retention policy marker Policy Decision

Generated: 2026-04-12
Scope: policy classification for `legacy class-retention policy marker` using user-supplied PowerShell evidence first.

## Classification Options Considered
- `keep-as-doc-placeholder`
- `archive-doc-references-later`
- `needs-manual-review`

## Chosen Classification (This PR)
- `keep-as-doc-placeholder`
- secondary flag: `needs-manual-review` for future retirement/rename decision lane

## Rationale (Evidence-Grounded)
Primary (user-supplied PowerShell evidence):
- `legacy class-retention policy marker` appears only in docs/planning/generated-doc files.
- no `legacy class-retention policy marker` directory exists on disk.
- no active runtime/code references were found.

Supporting cleanup artifacts:
- cleanup inventory marks `legacy class-retention policy marker` as docs-reference-only and non-existent on disk.
- cleanup matrix marks `legacy class-retention policy marker` as `needs-manual-review`.

Together, this indicates `legacy class-retention policy marker` is a planning placeholder, not an active runtime surface.

## Allowed Now
- Maintain docs-only placeholder tracking.
- Document policy/validation guard for future cleanup sequencing.
- Keep references explicit until a dedicated rename/removal docs lane is approved.

## Forbidden Now
- Creating a `legacy class-retention marker path` directory.
- Moving, renaming, or deleting paths in a structural cleanup lane from this PR.
- Mixing `legacy class-retention policy marker` policy work with runtime changes, templates changes, archive changes, or SpriteEditor archive changes.

## Prerequisites For Future Rename/Removal/Archive Lane
1. Reconfirm docs-only reference surface at execution time.
2. Confirm no runtime/code references exist at execution time.
3. Prepare synchronized updates for roadmap + cleanup targets + cleanup reports.
4. Provide clear replacement wording if placeholder is renamed/retired.
5. Run guard checks and capture before/after validation report in same lane.

## Reclassification Signals
Move from `keep-as-doc-placeholder` to `archive-doc-references-later` or full removal only when:
- docs references are reduced to a clear, bounded set,
- target intent is resolved (historical placeholder vs active policy target),
- synchronized docs updates are ready and validated.

Escalate to `needs-manual-review` when:
- contradictory references appear (for example runtime/code usage), or
- policy intent cannot be resolved from cleanup docs alone.

## Decision Summary
- `legacy class-retention policy marker` remains docs-only placeholder in this PR.
- No structural path action is authorized or performed.


