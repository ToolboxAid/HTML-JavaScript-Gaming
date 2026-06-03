# BUILD_PR — LEVEL 09.02 ASSET OWNERSHIP NORMALIZATION

## Purpose
Normalize asset ownership so asset folders live under the owning scope instead of under broad shared
buckets that hide ownership.

## Architectural decision
If `platform` contains art/audio/data assets for a specific game, sample, or tool, then it should
move under that owner as:

- `games/<GameName>/assets/platform/`
- `samples/<SampleName>/assets/platform/`
- `tools/<ToolName>/assets/platform/`

## Important distinction
This rule applies only to **assets**.

Do **not** move:
- engine/runtime platform code
- browser/platform abstraction code
- shared non-asset infrastructure

Only move folders/files that are truly asset payloads:
- images
- sprites
- tile sets
- audio
- json/data payloads used as content
- SVG/background/parallax payloads

## Why this is the right rule
`platform/assets` hides ownership.
If the asset belongs to one game/sample/tool, it should live with that owner.
This improves:
- clarity
- portability
- deletion safety
- packaging
- future per-owner publishing

## Scope
Docs-first repo-wide ownership correction specification for:
- games
- samples
- tools

## Ownership rules
### Game-owned
Move to:
- `games/<GameName>/assets/...`

### Sample-owned
Move to:
- `samples/<SampleName>/assets/...`

### Tool-owned
Move to:
- `tools/<ToolName>/assets/...`

### Truly shared assets
Keep shared only if they are genuinely reused across multiple owners and are not owner-specific.
These must be documented explicitly as shared assets, not treated as default storage.

## Migration rule
When moving assets:
1. preserve exact payloads
2. update references/import paths
3. do not duplicate unless temporary transition requires it
4. remove old location after references are verified
5. do not move runtime/platform code in this PR

## Required scan
Codex must scan for:
- `platform/assets`
- `*/platform/assets`
- any owner-specific assets stored outside owner `assets/`

## Deliverables
This PR should produce a docs-first implementation plan and Codex execution instructions for a
repo-wide ownership correction pass.

## Acceptance criteria
1. no owner-specific asset remains under broad `platform/assets`
2. game assets live under `games/<GameName>/assets/`
3. sample assets live under `samples/<SampleName>/assets/`
4. tool assets live under `tools/<ToolName>/assets/`
5. path references are updated
6. no runtime/platform code moved
7. genuinely shared assets, if any, are called out explicitly

## Out of scope
- engine refactors
- runtime platform abstraction changes
- asset content redesign
- compression/optimization work
