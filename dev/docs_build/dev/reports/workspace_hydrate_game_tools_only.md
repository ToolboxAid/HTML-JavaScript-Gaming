# Workspace Hydrate Game Tools Only

## Scope
- Updated Workspace Manager V2 session hydration to hydrate only tools relevant to the selected game/workspace.
- Preserved the normalized per-tool session object:
  - `schema`
  - `workspace`
  - `data`
  - `dirty`
- Preserved the existing clean dirty defaults:
  - `isDirty: false`
  - `reason: null`
  - `changedAt: null`
  - `changedKeys: []`
- Did not change repo reference hydration at `workspace.repo.reference`.

## Hydration Rules
- Hydrate a tool when its payload exists in the selected game workspace config.
- Hydrate selected-game purpose launch-context tools that need the active game context.
- Skip starter/dev-only tools when the selected game workspace does not explicitly provide tool data for them.
- Disable skipped tool tiles after a game is opened so only hydrated tools are launchable.

## Asteroids Hydration Report
| Tool | Result | Reason |
| --- | --- | --- |
| `asset-manager-v2` | Hydrated | Tool data is present in selected game workspace config. |
| `palette-manager-v2` | Hydrated | Tool data is present in selected game workspace config. |
| `preview-generator-v2` | Hydrated | Tool has a selected-game workspace launch purpose. |
| `session-inspector-v2` | Hydrated | Tool has a selected-game workspace launch purpose. |
| `templates-v2` | Skipped | Starter/dev-only tool is not enabled by the selected game workspace config. |

## Validation Notes
- Selecting Asteroids does not create `workspace.tools.templates-v2`.
- Asset Manager V2 and Palette Manager V2 hydrate with their manifest data when present.
- Preview Generator V2 still opens from Workspace Manager V2 and can generate from hydrated repo/game session context.
- Session Inspector V2 shows hydrated game-relevant `workspace.tools.*` entries and no unrelated `workspace.tools.templates-v2` entry.

## Guardrails
- No cross-tool communication was added.
- No sample JSON was modified.
- No roadmap content was modified.
- No schema/runtime contract changes were made.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is Workspace Manager V2 session hydration and Workspace Manager V2 launch/session behavior, covered by `npm run test:workspace-v2`.
