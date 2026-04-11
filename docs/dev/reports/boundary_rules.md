# Tools Shared Boundary Rules

## Reuse Order
1. `src/engine/theme/*`
2. `src/engine/ui/*`
3. `tools/shared/platformShell.css`
4. tool-local CSS only for tool-specific concerns

## Allowed In `tools/shared`
- shell chrome
- common UI primitives
- common IO
- common preview helpers
- vector helpers
- project manifest / registry / validation helpers
- shared panel/inspector utilities

## Forbidden In `tools/shared`
- speculative abstractions without reuse proof
- tool-specific editor state
- tool-specific workflows
- unique tool rendering logic
- unique tool command sets
- broad legacy carryover

## BUILD Discipline For Follow-up PRs
- exact-cluster only
- one purpose only
- preserve `SpriteEditor_old_keep`
- no engine-core broadening
- no opportunistic CSS rewrites outside named scope
