Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ENGINE-STABILIZATION-PHASE2-PERSISTENCE-DEFAULTS-AND-FX-DETERMINISM. Harden engine/persistence/StorageService.js so engine-level persistence behavior is safe when browser storage is unavailable, adjusting engine/release/SettingsSystem.js only if required for safe composition and unchanged behavior. Add a deterministic RNG seam to engine/fx/ParticleSystem.js without redesigning the FX system, preserving default runtime behavior. Add focused tests for storage absence safety and FX determinism. Do not change scene lifecycle, Asteroids extraction, gameplay tuning, or unrelated files.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that persistence is safe without browser storage globals, ParticleSystem supports deterministic control, focused tests were added, and no unrelated subsystems changed.
