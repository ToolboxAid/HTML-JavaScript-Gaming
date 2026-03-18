# ToolboxAid Engine Standards v1

## Purpose

Define the architecture and design rules for the engine.

## Core principles

### 1. Engine first

The engine must behave like a reusable framework, not a specific game.

- No game-specific logic in `engine/`
- `games/` and `samples/` are consumers

### 2. Clear boundaries

Every file should be understandable as:

- **PUBLIC** — safe for games to use
- **INTERNAL** — used only by tests (should not shared within the engine)
- **PRIVATE** — implementation detail only

### 3. Single responsibility

- One class = one main purpose
- Avoid mixing rendering, physics, input, lifecycle, and persistence responsibilities

### 4. No hidden side effects

- Functions should not mutate unrelated state silently
- Inputs and outputs should be explicit
- Global state should be minimized and intentional

### 5. Consistent API design

- Method names are predictable
- Parameter ordering is stable
- Return shapes are stable

### 6. Lifecycle ownership

The engine should clearly own:

- initialization
- update loop
- render loop
- teardown / cleanup

No duplicate lifecycle ownership across unrelated systems.

### 7. Dependency direction

Preferred direction:

- `engine/core` → subsystems
- subsystems → utilities

Avoid:

- subsystem dependence on `games/`
- circular dependencies
- deep cross-system reach-through

### 8. Performance awareness

Hot paths should:

- avoid allocations in tight loops
- minimize repeated work
- reuse data structures where practical

### 9. Backward compatibility

- Do not break public APIs casually
- Deprecate before removing when practical
- Record behavior changes clearly

### 10. Small PR philosophy

- One concern per PR
- No mixed changes
- Clear intent and risk

## Red flags

- god objects
- duplicate utilities
- hidden dependency chains
- multiple ways to do the same thing
- state mutation across subsystem boundaries
- games reaching directly into internals

## Review enforcement questions

During review, ask:

- Does this break boundaries?
- Does this increase coupling?
- Does this hide ownership?
- Does this make hot paths slower?
- Is this consistent with existing engine patterns?
