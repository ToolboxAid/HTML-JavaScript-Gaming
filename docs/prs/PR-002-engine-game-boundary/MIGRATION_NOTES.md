PR-002 — migration notes

### This PR Does
- defines the boundary model for `engine/game`
- documents public/internal/transitional intent
- preserves compatibility
- prepares later code PRs without changing behavior

### This PR Does Not Do
- change runtime behavior
- move files
- rewrite imports
- remove compatibility exports

### Next Follow-Up Direction
Future PRs may:
- mark concrete files or exports with boundary status
- narrow transitional surfaces
- reduce engine/game coupling further
- move more game-facing orchestration toward explicit `GameBase` contracts

### Safety Rule
Behavior changes remain out of scope until a later PR explicitly proposes them.
