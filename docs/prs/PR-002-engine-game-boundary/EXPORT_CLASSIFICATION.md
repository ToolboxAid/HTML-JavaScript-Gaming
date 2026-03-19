PR-002 — engine/game export classification

### Classification Standard
Use the following labels for `engine/game` surfaces.

#### Public
Use for exports that are intended as stable game-facing contracts.

Typical examples:
- `GameBase`
- stable orchestration interfaces
- safe, high-level game registration or update contracts

#### Internal
Use for exports that exist only to support runtime composition or orchestration.

Typical examples:
- runtime binding helpers
- hidden coordination utilities
- internal setup modules

#### Transitional
Use for exports that temporarily preserve compatibility during refactor.

Typical examples:
- wrapper exports
- bridge modules
- legacy re-exports

### Review Rule
Every `engine/game` export should be explicitly understood as one of:
- public
- internal
- transitional

Anything unclear should be treated as transitional until a later PR narrows it.
