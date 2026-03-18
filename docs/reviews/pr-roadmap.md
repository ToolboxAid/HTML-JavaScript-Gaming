# PR Roadmap

## Status legend

- `pending`
- `in-progress`
- `done`
- `deferred`

## Planned PRs

### PR-001

- **Title:** docs: consolidate review and PR workflow docs
- **Scope:** `docs/`
- **Risk:** Low
- **Status:** pending
- **Why:** establish a consistent operating system for future code-review and refactor work

### PR-002

- **Title:** docs: define engine API and boundary levels
- **Scope:** `docs/ENGINE_API.md`, `docs/ENGINE_STANDARDS.md`
- **Risk:** Low
- **Status:** pending
- **Why:** align review language around public/internal/private distinctions

### PR-003

- **Title:** docs: add performance review workflow
- **Scope:** `docs/performance.md`
- **Risk:** Low
- **Status:** pending
- **Why:** separate performance work from cleanup and architecture changes

### PR-004

- **Title:** review: record engine/core architecture findings
- **Scope:** `docs/reviews/architecture-review-v1.md`
- **Risk:** Low
- **Status:** pending
- **Why:** create traceable review artifacts before implementation PRs


### PR-005

- **Title:** refactor: split runtime and visual helpers out of `engine/core`
- **Scope:** `engine/core` and destination folders
- **Risk:** Medium
- **Status:** pending
- **Why:** tighten folder boundaries so `engine/core` contains runtime ownership only

### PR-006

- **Title:** refactor: introduce explicit runtime start for `GameBase`
- **Scope:** `engine/core/gameBase.js`
- **Risk:** High
- **Status:** pending
- **Why:** separate construction from boot and make the lifecycle easier to test

### PR-007

- **Title:** refactor: replace subclass cleanup conventions with registered disposables
- **Scope:** `engine/core/gameBase.js`
- **Risk:** Medium
- **Status:** pending
- **Why:** remove hidden subclass field-name dependencies from base teardown

### PR-008

- **Title:** docs: classify `engine/core` public and internal APIs
- **Scope:** `docs/ENGINE_API.md`, `docs/ENGINE_STANDARDS.md`
- **Risk:** Low
- **Status:** pending
- **Why:** define the supported surface before larger refactors

### PR-009

- **Title:** refactor: move runtime services toward instance-backed ownership
- **Scope:** `engine/core/fullscreen.js`, `engine/core/performanceMonitor.js`, `engine/core/runtimeContext.js`
- **Risk:** High
- **Status:** pending
- **Why:** reduce global state and align service lifetime with runtime instances

