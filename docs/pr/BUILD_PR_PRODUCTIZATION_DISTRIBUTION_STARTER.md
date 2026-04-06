Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_PRODUCTIZATION_DISTRIBUTION_STARTER.md

# BUILD_PR_PRODUCTIZATION_DISTRIBUTION_STARTER

## Build Summary
Created a docs-only productization distribution starter bundle defining how Asteroids and Breakout are packaged, discovered, and shared.

## Defined Contracts

### 1. Showcase Landing Page Structure
Recommended structure for a dedicated distribution landing page:
1. Hero block:
- Productized showcase intent.
- Supported browser baseline.
- Quick start call-to-action.

2. Showcase sample cards:
- Asteroids card.
- Breakout card.
- Badge row: `Playable` and `Debug Showcase`.
- Buttons:
  - `Play` -> default path.
  - `Play (Debug)` -> explicit debug query entry.
  - `Demo` -> one-click demo mode query entry.

3. Help and support block:
- Debug key combos.
- Troubleshooting basics.
- Production-safe default note.

4. Build/package metadata block:
- Package version.
- Build date.
- Included sample list.

### 2. Sample Discovery Contract (`games/index.html`)
Starter discovery improvements contract:
- Keep showcase badge visible and unique.
- Ensure Asteroids and Breakout both display debug showcase intent.
- Keep links predictable and documented:
  - Play: `index.html`
  - Debug: `index.html?debug=1`
  - Demo: `index.html?debugDemo=1`

### 3. Packaging Strategy (Standalone vs Repo-linked)
Two packaging modes are defined:

A. Repo-linked package:
- Intended for contributors and local development.
- Uses existing repo-relative paths.
- Includes docs and source for iterative updates.

B. Standalone showcase package:
- Intended for external sharing/demo distribution.
- Includes only runtime-required files for Asteroids and Breakout.
- Excludes tests, temp artifacts, and unrelated game/sample trees.

### 4. Asset Bundling Rules
Include:
- `games/Asteroids/**` runtime-required files.
- `games/Breakout/**` runtime-required files.
- Required engine runtime/UI assets referenced by those samples.
- Required shared debug tooling files used by those samples.

Exclude:
- `tests/**`
- `tmp/**`
- unrelated game/sample folders
- planning/report artifacts not needed for runtime demo package

Path rules:
- Preserve browser-resolvable relative paths.
- Avoid rewriting paths during packaging unless explicitly versioned by a later PR.

### 5. User Entry Points (Play vs Debug)
Asteroids and Breakout entry contract:
- Play: `/games/<Sample>/index.html`
- Debug: `/games/<Sample>/index.html?debug=1`
- Demo: `/games/<Sample>/index.html?debugDemo=1`

Behavior expectations:
- Play remains production-safe default.
- Debug and Demo remain explicit opt-in.
- Debug UI messaging is consistent across both samples.

## Roadmap State Updates
`docs/dev/PRODUCTIZATION_ROADMAP.md` bracket-only updates:
- Track R / Showcase landing page: `[ ]` -> `[.]`
- Track R / Build packaging strategy: `[ ]` -> `[.]`
- Track R / Asset bundling rules: `[ ]` -> `[.]`

## Validation
- Docs-only scope preserved.
- No engine files changed.
- No BIG_PICTURE roadmap edits.
- Productization roadmap edits are bracket-only.