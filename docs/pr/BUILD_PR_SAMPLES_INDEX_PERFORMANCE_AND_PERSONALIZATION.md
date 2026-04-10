# BUILD_PR_SAMPLES_INDEX_PERFORMANCE_AND_PERSONALIZATION

## Objective
Implement the final bundled samples wave by improving samples index responsiveness and adding lightweight favorites/pinning without changing canonical sample paths or sample runtime behavior.

This BUILD covers:
- index performance pass
- favorites / pinning

Canonical path contract remains:
- `samples/phaseXX/XXYY/index.html`

## PR Purpose
One purpose only:
- improve repeated-use samples index experience

## In Scope
- optimize the samples index so filtering, search, and rendering remain responsive as sample count grows
- reduce unnecessary DOM work or repeated full rebuilds where a narrower update path is feasible
- add lightweight favorites / pinning behavior for samples
- keep personalization client-side only
- preserve metadata-driven readable UI
- preserve canonical sample paths
- keep the implementation dependency-free

## Out of Scope
- no gameplay changes
- no engine-core changes
- no path normalization changes
- no metadata schema redesign
- no thumbnail/hover visual redesign
- no navigation redesign beyond what is required for favorites interaction
- no server-side persistence
- no dependency installation

## Required Behavior
1. Filtering and search remain correct after performance changes.
2. Index updates stay responsive under normal browse flows.
3. Favorites / pins can be added and removed from the samples index.
4. Favorites / pins persist locally for the same user on the same machine/browser.
5. Favorites must not alter canonical paths or metadata identity.
6. Representative Phase 13 samples including 1316–1318 must continue to load correctly.

## Expected Targets
Codex should keep reads narrow and stop if the actual required target list expands materially.

Expected implementation targets:
- `samples/index.html`
- minimal JS/CSS directly supporting index rendering, filtering, and favorites behavior
- minimal metadata-driven files directly needed for rendering or persistence keys
- report files under `docs/` only for output packaging

## Windows / Execution Constraints
- target platform: Windows
- prefer Node.js or vanilla JS where scripting support is needed
- no `npm install`
- no `node_modules`
- no PowerShell path interpolation
- ZIP output under `<project folder>/tmp/` is mandatory

## Personalization Rules
- use lightweight client-side persistence only, such as `localStorage`
- keys must be scoped clearly to the samples feature
- persistence must fail gracefully if unavailable
- favorites must not block index rendering if persistence is unavailable

## Validation Requirements
Minimum required validation:
- load `samples/index.html`
- verify filter/search behavior still works correctly
- verify the index remains responsive during repeated filter/search interactions
- add one or more favorites / pins and verify they render correctly
- reload the page and verify favorites / pins persist locally
- remove a favorite / pin and verify removal persists
- open representative sample links and verify Phase 13 samples 1316, 1317, 1318 still load
- verify console stays clean for tested pages

## Acceptance Criteria
- index responsiveness improves or remains stable under the tested browse flows
- favorites / pinning works and persists locally
- no canonical path changes
- no gameplay changes
- no engine-core changes
- changed-file count stays minimal
- repo-structured delta ZIP is produced under `<project folder>/tmp/`

## Fail Fast
Stop and report if:
- performance work would require a broad rendering architecture rewrite
- favorites would require server-side storage
- persistence behavior becomes coupled to unrelated systems
- implementation expands beyond index responsiveness and lightweight personalization
- the ZIP cannot be produced at the exact requested path
