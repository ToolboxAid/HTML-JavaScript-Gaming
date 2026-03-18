# Architecture Review v1

## samples findings

### Findings
1. `samples/` is organized more clearly than many engine folders. It is grouped by domain:
   - `samples/engine/`
   - `samples/input/`
   - `samples/output/`
   - `samples/visual/`

   At the folder level, this is a strong documentation/discoverability structure.

2. The sample set serves **two different architectural purposes**:
   - reference templates / recommended engine usage (`samples/engine/Game Engine`, refreshed visual samples)
   - older or lower-level feature demos (`samples/input/Mouse`, `samples/input/GameControllers`, some output samples)

   That dual purpose is useful, but it creates inconsistency in sample architecture style.

3. There are **two major sample patterns** in use:
   - engine-driven samples built on `GameBase`
   - direct DOM/canvas samples with manual init / requestAnimationFrame / cleanup

   Examples:
   - `samples/engine/Game Engine`, `samples/visual/Fullscreen Gaming`, `samples/visual/Solar System`, `samples/visual/Particle` use `GameBase`
   - `samples/input/Mouse` and `samples/input/GameControllers` use direct bootstrap and manual loops

   This is the biggest architecture finding in `samples/`.

4. The engine-driven samples are increasingly consistent:
   - subclass `GameBase`
   - instantiate inputs in `onInitialize()`
   - own state handlers in `game.js`
   - keep config in `global.js`
   - rely on runtime fullscreen/performance integration

   This looks like the repo’s intended “modern” sample architecture.

5. The direct/manual samples are still valuable, but they teach a different architectural story:
   - manual canvas init
   - manual RAF loop
   - manual cleanup hooks
   - direct engine utility imports rather than runtime-shell usage

   That makes them better as low-level demos than as primary usage references.

6. The sample READMEs are generally strong. Many of them now explicitly say what they demonstrate and whether they are:
   - engine-driven
   - DOM/canvas-driven
   - focused subsystem demos

   This is a strong documentation pattern.

7. `samples/engine/Game Engine` is functioning as a de facto reference template. It includes:
   - changelog
   - checklist
   - visual regression checklist
   - cleaner state flow
   - runtime shell structure

   Architecturally, that sample should probably be treated as the canonical template.

8. `samples/engine/2D side scroll tile map` is a useful engine-driven sample, but it still depends on `engine/game/gameUtils.js` for player-select flow. That reinforces the earlier finding that some game-layer helpers in `engine/game` are really sample/gameplay concerns.

9. The visual samples mostly reinforce the new engine-driven pattern well:
   - `Draw Shapes`
   - `Fullscreen Gaming`
   - `Move Objects`
   - `Particle`
   - `Solar System`

   These are good consumer validation for `GameBase`, input ownership, and sample shell conventions.

10. The input samples are less consistent:
   - `Keyboard` uses `GameBase`
   - `Mouse` does not
   - `GameControllers` does not

   This means the input sample group itself teaches mixed architecture conventions.

11. The output samples are also mixed:
   - some are intentionally page/UI-driven (`Audio`, `MIDI Player`, `Synthesizer`)
   - these are valid demos, but they are not really exercising the same game-runtime architecture as the engine and visual samples

12. Public/internal/private boundary teaching is currently implicit. Samples often import internal-ish engine modules directly:
   - `engine/core/canvasUtils.js`
   - `engine/core/canvasText.js`
   - `engine/renderers/primitiveRenderer.js`
   - `engine/renderers/rendererGuards.js`
   - debug helpers from `engine/utils`

   That is fine for internal repo samples, but it means samples are not strongly enforcing the “public API only” story.

### Risks
#### High
1. **Mixed sample architecture patterns**
   Some samples teach `GameBase` runtime ownership while others teach manual bootstrap/loop ownership. This weakens the repo’s architectural guidance.

2. **Canonical usage story is not explicit**
   The repo appears to prefer the newer engine-driven shell pattern, but older/manual samples still sit beside it without a clear “reference vs low-level demo” distinction.

3. **Samples import internals freely**
   If samples are meant to be onboarding/reference material, they may normalize use of internal modules instead of stable public APIs.

#### Medium
4. **Input samples are internally inconsistent**
   Keyboard uses `GameBase`; Mouse and GameControllers do not.

5. **Output samples are architecture outliers**
   They are valid demos, but they do not align with the engine-driven sample shell story.

6. **Engine/game helper leakage into samples**
   Samples depend on helpers like `engine/game/gameUtils.js`, reinforcing weak boundaries found earlier in the engine.

#### Lower
7. **Template maturity unevenness**
   Some samples have modern documentation/checklists/changelogs, while others are still lighter-weight feature demos.

### PR Candidates
#### PR-041 — Classify samples as reference templates vs low-level demos
- Type: architecture/docs
- Risk: low
- Goal: explicitly label each sample as one of:
  - canonical engine-driven template
  - subsystem demo
  - low-level/manual integration example

#### PR-042 — Normalize input samples around a shared sample shell
- Type: architecture/refactor
- Risk: medium
- Goal: align `Keyboard`, `Mouse`, and `GameControllers` samples under a clearer common pattern, while preserving low-level demos only where intentional

#### PR-043 — Define sample import rules
- Type: architecture/docs
- Risk: low
- Goal: document when samples may import:
  - public APIs only
  - internal modules for engine-internal demos
- Make the distinction explicit in READMEs

#### PR-044 — Promote `samples/engine/Game Engine` as canonical starter template
- Type: docs/architecture
- Risk: low
- Goal: formally designate this sample as the recommended starting point for new engine-based projects

#### PR-045 — Remove gameplay helper leakage from engine-driven samples
- Type: architecture/refactor
- Risk: medium
- Goal: reduce dependencies on misplaced engine gameplay helpers such as `engine/game/gameUtils.js`

## PR Roadmap Additions

### PR-041
Title: Classify samples by architectural role
Scope: samples, docs
Risk: Low
Status: pending

### PR-042
Title: Normalize input samples around a shared shell pattern
Scope: samples/input
Risk: Medium
Status: pending

### PR-043
Title: Define sample import boundary rules
Scope: samples, docs
Risk: Low
Status: pending

### PR-044
Title: Promote Game Engine sample as canonical starter template
Scope: samples/engine/Game Engine, docs
Risk: Low
Status: pending

### PR-045
Title: Remove gameplay helper leakage from engine-driven samples
Scope: samples/engine, engine/game
Risk: Medium
Status: pending
