# LEVEL_11_1_HANDOFF_CANDIDATE_AND_OWNERSHIP

## Candidate
`objectiveProgress` becomes the first authoritative slice managed by the advanced world/game state layer.

## Ownership Model
- The advanced state layer owns the authoritative value for `objectiveProgress`
- Producers may request updates only through approved events and named transitions
- Consumers may read only through public selectors
- No direct mutation outside the transition path

## Ownership Limits
- Scope is limited to objective progress mirror data only
- No adjacent objective metadata is promoted in this PR unless explicitly required by the 10.7 contract
- No other game state slices become authoritative in this PR

## Allowed Inputs
- Approved Level 10.4 objective progress events
- Approved Level 10.5 integration registration path

## Allowed Outputs
- Public selector reads for objective progress summary
- Public selector reads for objective progress by identifier
- Optional consumer reads for approved UI or gameplay observer path

## Disallowed Patterns
- Direct writes by games, tools, or samples
- Engine imports into advanced authoritative slice logic
- Sample implementations acting as dependency sources
- Hidden side effects in selectors or utilities
