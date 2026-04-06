# APPLY_PR_DEBUG_SURFACES_PRESETS

## Execution Steps
1. Create DebugPresetRegistry and DebugPresetApplier
2. Implement preset commands (preset.*)
3. Add shared presets:
   - gameplay
   - rendering
   - systems
   - minimal
   - qa
4. Register via registerStandardDebugPresets()
5. Validate:
   - overlay updates correctly
   - preset switching works
   - persistence behavior is correct

## Rules
- Presets = configuration only (no runtime logic)
- Use public APIs only
- No feature expansion
