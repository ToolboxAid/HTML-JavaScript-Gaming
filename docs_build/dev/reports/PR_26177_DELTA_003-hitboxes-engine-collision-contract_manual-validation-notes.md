# PR_26177_DELTA_003 Hitboxes Engine Collision Contract Manual Validation Notes

- Confirmed this PR is stacked from `PR_26177_DELTA_002-hitboxes-foundation`, not from `main`.
- Confirmed the implementation is engine-owned shared collision logic under `src/engine/collision/`.
- Confirmed no Hitboxes editor UI files were modified.
- Confirmed the high-speed vertical swept AABB regression detects impact at time `0.4`.
- Confirmed impact normal for downward motion is `{ x: 0, y: -1 }`.
- Confirmed before, after, and impact positions are exposed by the contract result.
