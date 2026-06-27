# PLAN_PR_PARALLAX_EDITOR_ASSET_REGISTRY_ADOPTION

## Goal
Adopt project asset registry within Parallax Editor while maintaining backward compatibility.

## Scope
- Read/write parallax layers via project asset registry
- Reference assets via IDs (not paths)
- Maintain legacy file support

## Constraints
- No engine changes
- No breaking existing tools
- Registry is source of truth

## Contracts
- layer.assetRefs.imageId
- lazy resolution
- fallback for missing assets

## Validation
- Load existing parallax JSON
- Save new registry-based project
- No runtime errors
