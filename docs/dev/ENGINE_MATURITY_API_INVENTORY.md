# Engine Maturity API Inventory

## Public Seams (Promotable)
- command registration/discovery/execution output contract
- panel registration and descriptor contract
- provider registration and read-only snapshot contract
- debug visibility and deterministic render-order control seams
- plugin lifecycle seam (`register/enable/disable/dispose`)

## Internal (Not Promoted)
- internal overlay composition internals
- private runtime state containers
- persistence internals
- sample-specific hacks/bindings

## Transitional
- compatibility shims for legacy paths only when required
- deprecation notes with replacement path

## Promotion Gate
Promote only proven, documented, deterministic surfaces that do not leak private state shape.
