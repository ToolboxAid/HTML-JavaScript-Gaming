# Architecture Review v1

## engine/utils findings

### Findings
1. `engine/utils` is not a single coherent subsystem. It is currently a catch-all folder containing:
   - debug helpers (`debugFlag.js`, `debugLog.js`)
   - validation helpers (`objectValidation.js`, `stringValidation.js`)
   - cleanup/state helpers (`objectCleanup.js`, `pngAssetState.js`)
   - runtime/shared utilities (`systemUtils.js`, `timer.js`)
   - asset loading/cache support (`imageAssetCache.js`)
   - gameplay/effects mixin-like behavior (`canExplode.js`)

   This is the biggest architectural issue in the folder.

2. Several files are strong narrow utilities:
   - `DebugFlag` is a clean URL-query debug toggle helper.
   - `StringValidation` and `ObjectValidation` are coherent validation primitives.
   - `ObjectCleanup` is small and focused.
   - `PngAssetState` is a focused state holder for image asset lifecycle.

   These have good local boundaries, but they do not belong to the same architectural layer.

3. `Timer` is more than a utility. It is a stateful runtime service/object with:
   - active timer instances
   - global registry via `Timer.timers`
   - visibility-wide pause/resume coordination

   Architecturally, this fits better as a runtime/core service than a generic util.

4. `SystemUtils` is a classic broad utility bucket. It includes:
   - string/case helpers
   - object-type helpers
   - config validation
   - general-purpose support methods

   This creates “misc utility sink” risk. It is the least well-bounded file in the folder.

5. `ImageAssetCache` is a well-defined service, but it is not generic utility code. It is specifically:
   - browser image loading
   - transparent sprite caching
   - asset/resource management

   That makes it closer to an asset/resource subsystem than a util.

6. `CanExplode` is clearly misplaced in `engine/utils`. It is not a utility:
   - it owns explosion state
   - creates `ParticleExplosion` instances
   - updates and destroys them
   - behaves like a mixin/behavior object

   This belongs closer to effects, behaviors, or gameplay object composition.

7. `DebugLog` is useful, but it couples debug logging to:
   - URL debug flags
   - stack trace inspection
   - console formatting

   It is a coherent debug helper, but it should likely live in a debug/diagnostics boundary rather than general utils.

8. Public/internal/private boundaries are very unclear because `engine/utils` mixes unrelated layers.

   Best current classification:
   - public:
     - `Timer`
     - maybe `DebugFlag`
     - maybe `StringValidation` / `ObjectValidation`
   - internal:
     - `ObjectCleanup`
     - `PngAssetState`
     - `ImageAssetCache`
     - `DebugLog`
   - misplaced / should move:
     - `CanExplode`
     - `Timer` (to core/runtime)
     - `ImageAssetCache` (to assets/resources)
     - debug helpers (to diagnostics/debug)

### Risks
#### High
1. **Catch-all utility bucket**
   `engine/utils` is absorbing multiple unrelated concerns, which makes boundaries weak and future growth messy.

2. **Misplaced behavior object**
   `CanExplode` is not a utility at all; it is stateful behavior/effects orchestration living in the wrong layer.

3. **Stateful runtime service hidden as a util**
   `Timer` has global coordination and active-instance ownership, so treating it as a generic utility understates its architectural role.

#### Medium
4. **`SystemUtils` sink risk**
   It is broad enough to become the default dumping ground for unrelated helpers.

5. **Asset/resource logic mixed into utils**
   `ImageAssetCache` is a specialized subsystem concern, not generic helper code.

6. **Debug/diagnostics mixed into utils**
   `DebugFlag` and `DebugLog` are coherent together, but not as part of a generic utils boundary.

#### Lower
7. **Public API ambiguity**
   Because the folder mixes many concerns, consumers are likely to import internals directly.

### PR Candidates
#### PR-030 — Split `engine/utils` into real subsystem boundaries
- Type: architecture
- Risk: medium
- Goal: break the catch-all folder into:
  - `engine/debug/` or `engine/diagnostics/`
  - `engine/validation/`
  - `engine/assets/` or `engine/resources/`
  - `engine/runtime/` or move selected files into `engine/core`
  - `engine/effects/` or `engine/behaviors/`

#### PR-031 — Move `CanExplode` out of utils
- Type: architecture/refactor
- Risk: medium
- Goal: relocate to a behavior/effects layer such as:
  - `engine/effects/`
  - `engine/behaviors/`
  - `engine/objects/behaviors/`

#### PR-032 — Move `Timer` into runtime/core boundary
- Type: architecture/refactor
- Risk: medium
- Goal: reclassify `Timer` as a runtime service/object instead of generic utility

#### PR-033 — Break up or constrain `SystemUtils`
- Type: architecture/refactor
- Risk: medium
- Goal: either:
  - split narrow helpers into focused modules
  - or formally constrain `SystemUtils` to a documented limited role

#### PR-034 — Move `ImageAssetCache` into asset/resource subsystem
- Type: architecture/refactor
- Risk: low
- Goal: keep asset loading and caching close to other image/png resource concerns

#### PR-035 — Create explicit debug/diagnostics boundary
- Type: architecture/refactor/docs
- Risk: low
- Goal: move:
  - `debugFlag.js`
  - `debugLog.js`
  into a dedicated diagnostics area

## PR Roadmap Additions

### PR-030
Title: Split engine/utils into focused subsystem boundaries
Scope: engine/utils
Risk: Medium
Status: pending

### PR-031
Title: Move CanExplode out of engine/utils
Scope: engine/utils, engine/effects
Risk: Medium
Status: pending

### PR-032
Title: Move Timer into runtime/core boundary
Scope: engine/utils, engine/core
Risk: Medium
Status: pending

### PR-033
Title: Break up or constrain SystemUtils
Scope: engine/utils
Risk: Medium
Status: pending

### PR-034
Title: Move ImageAssetCache into asset/resource subsystem
Scope: engine/utils, engine/assets
Risk: Low
Status: pending

### PR-035
Title: Create explicit debug diagnostics boundary
Scope: engine/utils
Risk: Low
Status: pending
