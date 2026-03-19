PR-003 — engine/game classification rules

### Public

An export is public when it is appropriate for direct use by game code and supports the stable direction of the architecture.

#### Public indicators
- directly supports game composition
- directly supports orchestration
- reinforces `GameBase` as the preferred entry point
- does not expose runtime-only plumbing

### Internal

An export is internal when it exists to support implementation detail, runtime coordination, or hidden setup behavior.

#### Internal indicators
- setup-only behavior
- runtime coordination
- hidden helpers
- implementation detail leakage

### Transitional

An export is transitional when it exists mainly to preserve compatibility during the refactor.

#### Transitional indicators
- legacy re-export
- compatibility wrapper
- bridge between old and new import paths
- not desired as permanent public API

### Decision Rule Priority

When classification is uncertain, use this order:
1. preserve compatibility
2. avoid public exposure of runtime internals
3. prefer `GameBase`-aligned public surfaces
4. freeze transitional scope rather than expand it
