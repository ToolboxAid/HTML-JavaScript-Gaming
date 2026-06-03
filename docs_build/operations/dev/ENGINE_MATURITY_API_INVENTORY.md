# Engine Maturity API Inventory

## Public Seams (Promotable)
- command registration/discovery/execution output contract
- panel registration and descriptor contract
- provider registration and read-only snapshot contract
- debug visibility and deterministic render-order control seams
- plugin lifecycle seam (`register/enable/disable/dispose`)
- shared contract version policy seam (`createVersionedContractPolicy`, `evaluateContractVersion`)

## Versioned Metadata Export Seams
- `getRenderContractVersionMetadata()`
- `getDevDiagnosticsContractVersionMetadata()`

## Internal (Not Promoted)
- internal overlay composition internals
- private runtime state containers
- persistence internals
- sample-specific hacks/bindings

## Transitional
- compatibility shims for legacy version string forms only
- deprecation notes with replacement path

## Promotion Gate
Promote only proven, documented, deterministic surfaces that do not leak private state shape.
