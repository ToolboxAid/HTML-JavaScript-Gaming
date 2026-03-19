PR-003 — engine/game export map

### Classification Matrix

#### Public
Use for exports that:
- support game composition or orchestration
- align with the `GameBase` public model
- avoid leaking runtime-only details

#### Internal
Use for exports that:
- coordinate hidden runtime details
- primarily exist for setup, wiring, or pass-through behavior
- should not be documented as stable game-facing API

#### Transitional
Use for exports that:
- exist mainly for compatibility
- bridge older imports to newer architecture
- should remain limited in scope until later cleanup PRs

### Concrete Export Recording Template

#### Record each export as:
- export name
- source file
- classification: public | internal | transitional
- reason
- GameBase alignment note
- compatibility note

### Current Decision Anchor

Until a later code PR is approved:
- public exports remain compatibility-safe
- internal exports are documented, not removed
- transitional exports remain allowed but frozen in scope
