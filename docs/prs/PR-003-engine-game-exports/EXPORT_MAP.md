PR-003 — engine/game export map

### Purpose

This document records the export classification structure for `engine/game`.

### Public

Public exports are the stable game-facing API surface.

#### Intended characteristics
- aligned to `GameBase`
- safe for game code to import directly
- do not leak runtime-only plumbing

### Internal

Internal exports are implementation details or runtime plumbing that should not be
treated as stable game-facing API.

#### Intended characteristics
- wiring or setup detail
- hidden orchestration helpers
- runtime coordination internals

### Transitional

Transitional exports exist to preserve compatibility during migration.

#### Intended characteristics
- bridge older import paths
- prevent breakage during architecture normalization
- should not expand in scope
