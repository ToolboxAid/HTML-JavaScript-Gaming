# PR_26127_006-preview-generator-v2-workspace-launch-hydration-fix

## Scope

- Preview Generator V2 workspace-launch hydration from Workspace Manager V2.
- Workspace Manager V2 Playwright coverage for the Preview Generator V2 launch path.
- Deprecated `toolbox/workspace-v2` was not modified.
- Sample JSON was not modified.
- No fallback behavior was added.

## Hydration Notes

- Workspace Manager V2 launch no longer writes the workspace/game label into the Preview Generator V2 repo root field.
- The repo root field remains `not selected` until the user selects an actual repo root folder.
- The workspace/game label is shown separately as Workspace launch context.
- Generate Image remains disabled during workspace launch until a valid repo root, target source, asset folder, and preview target file are all valid.
- Repo root selection now validates that the chosen folder exposes repo-level `games` and `tools` directories.

## Preview Target Notes

- Preview Generator V2 now resolves the workspace preview target as the schema-backed bezel image asset from the manifest.
- For Asteroids, the resolved preview target is `games/Asteroids/assets/images/bezel.png`.
- The asset folder still hydrates as `assets/images`, but hydration also records and displays the full preview target file path.
- Preview target validation checks that the resolved file exists and is image-like by response type or image filename extension.

## Validation

- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list` passed.
- `npm run test:workspace-v2` passed.
- Result: 24 passed.
- Playwright impacted: Yes.
- Full samples smoke test skipped because this PR is Workspace Manager V2 to Preview Generator V2 launch scoped.

## Manual Validation Notes

1. Open Workspace Manager V2.
2. Load Asteroids.
3. Launch Preview Generator V2 from the Preview Generator V2 tile.
4. Confirm Repo selected remains `not selected`, while Workspace launch shows `Asteroids workspace (games/Asteroids)`.
5. Confirm Preview target shows `games/Asteroids/assets/images/bezel.png`.
6. Confirm Generate Image is disabled before selecting the repo root.
7. Click Pick Repo Folder and choose the actual `HTML-JavaScript-Gaming` repo root.
8. Confirm Repo selected shows the actual repo folder and Generate Image becomes enabled.
