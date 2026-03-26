Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V2_6_CONTROL_PRIORITY_OVERFLOW_STRATEGY.md

# BUILD_PR — Sprite Editor v2.6 (Control Priority + Overflow Strategy)

## Objective
Make the adaptive canvas-native layout more resilient under tight space by introducing a centralized control priority and overflow policy.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout authority
- No DOM control additions
- No architecture rewrite
- No feature expansion outside layout resilience

## Required Design

### 1) Centralized priority model
Introduce a single control-priority policy that defines:
- always-visible controls
- compressible controls
- compactable controls
- overflow-eligible controls

Do not scatter priority rules throughout the code.

### 2) Priority tiers
Codex should define explicit tiers, for example:

#### Tier 1 — Must remain visible
- Full Screen
- Density/Mode control
- core file action(s) you consider essential

#### Tier 2 — Compress before hide
- Zoom controls
- Pixel-perfect toggle

#### Tier 3 — Lowest priority
- lower-priority export or convenience actions

Codex may refine exact membership, but the policy must be explicit and centralized.

### 3) Overflow strategy
When horizontal space gets tight, apply in this order:
1. reduce spacing
2. shorten labels
3. compact low-priority controls
4. collapse lowest-priority items into a compact overflow affordance

No overlap.
No clipping.
No off-screen controls.

### 4) Label shortening rules
Shortened labels must remain readable and intentional.
Examples:
- Full Screen -> Full
- Reset Zoom -> Reset
- Pixel Perfect -> Pixel

### 5) Overflow affordance
If collapse becomes necessary:
- add a compact canvas-native overflow control
- keep it inside SpriteEditorCanvasControlSurface
- keep hit-testing correct

### 6) Persistence
If overflow state is purely responsive, it does not need persistence.
If a user-facing mode is added, persist it.

## Validation
- No overlap in narrow layouts
- No clipped text
- Full Screen always visible
- Priority behavior is deterministic
- Overflow behavior is deterministic
- Hit-testing remains correct
- No console errors

## Scope
tools/*
docs/*
