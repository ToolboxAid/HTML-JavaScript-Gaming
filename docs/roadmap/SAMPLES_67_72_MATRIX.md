Toolbox Aid
David Quesenberry
03/21/2026
SAMPLES_67_72_MATRIX.md

# Samples 67–72 Matrix

| Sample | Name | Primary Concept | Inputs | Visual Proof | Shared Promotion |
|---|---|---|---|---|---|
| 67 | Hitboxes vs Hurtboxes | Separate attack/damage regions | Move + attack key | Boxes and overlap text | Maybe later |
| 68 | Projectile System | Spawn/move/despawn projectile | Fire key | Projectile path and hit | Maybe later |
| 69 | Health System | HP + death/reset | Attack/fire | HP counters | Yes, after validation |
| 70 | Damage + Knockback | Damage force response | Attack/fire | Target pushed on hit | Maybe later |
| 71 | Invulnerability Frames | Damage cooldown | Attack/fire | Flash / cooldown readout | Yes, likely |
| 72 | Simple Enemy AI | Idle/follow behavior | Movement | Enemy tracks player | No, not yet |

## Suggested Controls
- WASD / Arrow Keys → move
- Space or J → attack
- K or F → fire projectile
- R → reset sample state

## Build Order
1. 67
2. 68
3. 69
4. 70
5. 71
6. 72

## Notes
Keep AI and combat narrowly scoped. Avoid broad engine refactors in this pass.
