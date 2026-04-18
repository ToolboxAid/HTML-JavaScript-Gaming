# Asset Ownership Strategy (Level 10 Closeout)

## Decision
- Local-first ownership is the default strategy.
- Assets stay with the owning surface:
  - games: `games/<gameId>/assets/...`
  - samples: `samples/<phase>/<sampleId>/assets/...`
  - tool demos: `tools/.../assets/...`
- Shared ownership is promotion-by-rule only.

## Promotion Criteria (Required)
An asset may be promoted to shared status only when all criteria are true:
1. The asset is used by at least two independent owners.
2. The asset has a stable identifier and stable format contract.
3. The asset has an explicit owner handoff note with migration impact.
4. The asset is added to the promotion registry at:
   - `docs/reference/architecture-standards/specs/shared_asset_promotion_registry.json`
5. Validation passes with no unresolved ownership collisions.

## Enforcement Rules
- No silent sharing by convenience pathing.
- Cross-owner asset references are invalid unless registered in the promotion registry.
- Tool demos do not claim game-owned assets by default.
- Sample assets do not claim game/tool-owned assets by default.

## Scope Note
- This strategy closes section-10 ownership policy by using local ownership as the default and explicit promotion criteria for shared exceptions.
