# LEVEL_11_2_NEXT_CANDIDATE_SELECTION

Identify next candidate slice ONLY if expansion approved.

Candidate must:
- Be isolated
- Already observable via selectors
- Not require engine changes
- Not require multiple consumers

Examples (guideline only):
- score
- player status flags

## Review Selection (If EXPAND)
Selected next safest candidate slice: `score`

Why:
- already represented as an isolated state domain
- naturally selector-readable
- can remain transition-gated
- does not require engine core API changes
