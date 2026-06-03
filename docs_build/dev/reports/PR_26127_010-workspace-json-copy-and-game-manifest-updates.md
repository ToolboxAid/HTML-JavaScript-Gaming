# PR_26127_010 Workspace JSON Copy And Game Manifest Updates

## Summary
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Updated Workspace Manager V2 Workspace JSON to use a readonly textarea with a `[copy]` action in the accordion header.
- Copy now writes the current textarea value to the clipboard, falls back to selection copy when available, and logs clear success/failure to Status.
- Aligned `games/GravityWell/game.manifest.json` and `games/pong/game.manifest.json` to `tools/schemas/workspace.manifest.schema.json`.
- Updated Preview Generator V2 workspace launch hydration so repo selection comes from the workspace manifest repo root and Generate enables without manually clicking Pick Repo Folder when the launch context is valid.
- Kept Workspace Manager V2 launch target source constrained to Games during workspace launch.

## Manifest Notes
- Gravity Well and Pong manifests now use `documentKind: "workspace-manifest"`.
- Required tool payloads are limited to `palette-manager-v2` and `asset-manager-v2`.
- Image assets use the current asset object structure with `type`, `kind`, `role`, `path`, and `source`.
- Preview-role image assets are represented in the Asset Manager V2 asset registry rather than a standalone manifest preview path.
- No deprecated `asset-browser`, `palette-browser`, root wrapper context, or sample/tool workspace roots were added.

## Workspace JSON Copy Notes
- `[copy]` copies the current Workspace JSON textarea content, not a cached manifest value.
- Clipboard API success logs `OK Copied Workspace JSON to clipboard (...)`.
- Clipboard API absence or failure is not silent; Status logs `FAIL Workspace JSON copy failed: ...`.
- The Workspace JSON accordion was adjusted so the header and copy button remain clickable after the Tools control expands.

## Preview Launch Notes
- Preview Generator V2 reads the workspace manifest repo root into Repo selected during Workspace Manager V2 launch.
- Preview target hydration uses the manifest-selected preview image source and generated output target.
- Generate Image enables when repo root context, Games target source, asset folder, and preview image path validate.
- When the browser has a workspace repo root string but no File System Access directory handle, generation logs that output will download because direct path writes are unavailable from browser context.

## Validation
- `npm run test:workspace-v2` passed: 25/25 Playwright tests.
- `games/GravityWell/game.manifest.json` validated against `tools/schemas/workspace.manifest.schema.json`: valid.
- `games/pong/game.manifest.json` validated against `tools/schemas/workspace.manifest.schema.json`: valid.
- Syntax checks passed for changed Workspace Manager V2, Preview Generator V2, and Playwright helper JavaScript.

## Manual Validation
- Open Workspace Manager V2, load Asteroids, Gravity Well, and Pong, and confirm Workspace JSON reflects the selected manifest.
- Use Workspace JSON `[copy]` and confirm Status logs success; test a blocked clipboard environment and confirm Status logs failure.
- Launch Preview Generator V2 from Workspace Manager V2 and confirm Repo selected is the repo root context, target source shows Games only, preview target is hydrated, and Generate Image is enabled.
- Full samples smoke test skipped because this PR is Workspace/Preview launch and manifest scoped.
