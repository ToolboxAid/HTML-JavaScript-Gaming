# BUILD_PR_SHARED_EXTRACTION_02_EXACT_HELPER_MOVE (EXECUTABLE)

## Purpose
Move duplicated helper functions into src/shared with ZERO guessing.

## Exact Moves

### asFiniteNumber
FROM:
- src/advanced/promotion/createPromotionGate.js
- src/advanced/state/createWorldGameStateSystem.js
- games/network_sample_c/game/ReconciliationLayerAdapter.js

TO:
- src/shared/utils/numberUtils.js

### asPositiveInteger
FROM:
- src/advanced/promotion/createPromotionGate.js
- src/advanced/state/createWorldGameStateSystem.js
- games/network_sample_c/game/ReconciliationLayerAdapter.js
- games/network_sample_c/game/StateTimelineBuffer.js
- src/engine/debug/inspectors/shared/inspectorUtils.js

TO:
- src/shared/utils/numberUtils.js

### isPlainObject
FROM:
- src/advanced/state/utils.js
- src/advanced/state/events.js
- src/advanced/state/initialState.js
- src/advanced/state/transitions.js
- src/advanced/promotion/createPromotionGate.js

TO:
- src/shared/utils/objectUtils.js

### getState (ONLY shared system variants)
FROM:
- src/advanced/state/createWorldGameStateSystem.js
- samples/shared/worldGameStateSystem.js

TO:
- src/shared/state/getState.js

## Import Updates

All moved helpers must:
- remove local definition
- import from src/shared path

Example:
import { asFiniteNumber } from "../../shared/utils/numberUtils.js";

## Constraints
- DO NOT scan repo further
- DO NOT move additional helpers
- DO NOT modify logic
- DO NOT rename helpers

## Acceptance
- Helpers exist only in shared
- No duplicate definitions remain
- All imports updated
- Build passes
