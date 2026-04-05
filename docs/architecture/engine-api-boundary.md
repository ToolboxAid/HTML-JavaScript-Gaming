Toolbox Aid
David Quesenberry
04/05/2026
engine-api-boundary.md

# Engine API Boundary

## Boundary Rules
- `engine/` must not depend on `src/advanced/`.
- Advanced modules in `src/advanced/` must use public engine contracts only.
- Samples, tools, and games must not patch engine internals for project-specific behavior unless explicitly approved in PR scope.

## State Ownership
- Authoritative advanced state belongs in `src/advanced/state/`.
- Foundational reusable state/runtime primitives remain in `engine/`.

## Docs and Process Boundary
- Architecture decisions are documented in `docs/architecture/` and `docs/pr/`.
- Active execution controls stay in `docs/dev/`.
- Generated/stale outputs are moved to `docs/archive/` and not kept on active documentation surfaces.
