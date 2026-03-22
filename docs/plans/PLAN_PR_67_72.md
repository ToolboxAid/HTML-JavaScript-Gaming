Toolbox Aid
David Quesenberry
03/21/2026
PLAN_PR_67_72.md

# PLAN_PR: Samples 67–72

## Scope
This planning pass defines the next interaction/combat foundation samples:

- 67 → hitboxes vs hurtboxes
- 68 → projectile system
- 69 → health system
- 70 → damage + knockback
- 71 → invulnerability frames
- 72 → simple enemy AI (follow / idle)

## Goal
Extend the engine from interaction systems (61–66) into light combat behavior, while keeping each sample isolated, additive, and easy to test.

## Rules
- One main concept per sample
- No destructive rewrites
- Prefer sample-local logic first
- Promote to shared/engine only when repeated and clearly stable
- Preserve existing samples
- All new files require the standard header with filename

## Sample Breakdown

### Sample 67 — Hitboxes vs Hurtboxes
Purpose:
- Demonstrate the difference between an attack area and a damageable area

Planned contents:
- Player body
- Enemy body
- Attack hitbox drawn separately
- Hurtbox visualization
- Overlap debug text

Expected result:
- Attack region can overlap hurtbox without merging entity body/collision logic

### Sample 68 — Projectile System
Purpose:
- Introduce spawned moving attack objects

Planned contents:
- Fire projectile with key press
- Projectile travel direction
- Lifetime / despawn
- Solid/world bounds cleanup
- Simple hit detection against target

Expected result:
- Reusable projectile flow without full combat framework

### Sample 69 — Health System
Purpose:
- Add health values and simple death/disable state

Planned contents:
- HP on player and enemy
- Damage application function
- HUD readout
- Dead / inactive state
- Reset behavior for demo testing

Expected result:
- Combat outcomes become measurable and visible

### Sample 70 — Damage + Knockback
Purpose:
- Add force response when damage occurs

Planned contents:
- Damage event carries direction
- Knockback impulse
- Brief movement response
- Keep collision stable while reacting

Expected result:
- Hits feel physical, not just numeric

### Sample 71 — Invulnerability Frames
Purpose:
- Prevent repeated damage every frame during overlap

Planned contents:
- Damage cooldown timer
- Visual feedback (flash or color swap)
- Ignore repeated hits while invulnerable

Expected result:
- Stable and readable damage behavior

### Sample 72 — Simple Enemy AI
Purpose:
- Add basic enemy decision loop using prior systems

Planned contents:
- Idle state
- Follow player when in range
- Stop or return to idle when far away
- Optional contact damage / attack region

Expected result:
- First end-to-end mini combat loop

## Engine / Shared Promotion Guidance
Potential shared helpers after validation:
- overlap helpers for hitbox/hurtbox pairs
- damage application utility
- small combat state flags
- projectile lifetime helper

Not yet recommended for promotion:
- full combat framework
- large AI framework
- complex state machine rewrite

## Test Intent
- Each sample must be individually launchable from samples/index.html
- Clear visual proof on screen
- No hidden mechanics requiring code inspection
- Keyboard controls documented in each sample page

## Deliverables for BUILD_PR
- sample67–sample72 folders
- minimal docs
- updated samples/index.html
- BUILD_PR_67_72.md
- commit comment
- next command

## Risks
- Over-coupling combat to movement too early
- Promoting unstable helpers to shared too soon
- Mixing AI + projectile + health into one sample beyond the intended scope

## Recommendation
Proceed with a surgical BUILD_PR for 67–72 using sample-local logic first, then normalize only repeated patterns later.
