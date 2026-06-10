# DB Viewer Table Inventory Report

Generated: 2026-06-09
Source: `/api/mock-db/snapshot` from the active Local Mem DB adapter.

## Summary

| Check | Status | Evidence |
| --- | --- | --- |
| Active DB adapter tables are rendered through API snapshot. | PASS | Snapshot returned 27 tables. |
| Empty tables keep schema visibility. | PASS | `AdminDbViewer.spec.mjs` verifies empty `toolbox_votes`, cleared tables, and Local DB readonly empty tables still show headers. |
| Toolbox Votes logical grouping exists. | PASS | `viewerGroups` includes `Toolbox Votes` with `toolbox_votes`. |
| `toolbox_vote_order` grouping support. | PASS | The grouping contract includes `toolbox_vote_order` when present; active adapter does not currently expose that table. |

## Viewer Groups

| Group | Tables |
| --- | --- |
| All | all 27 active adapter tables |
| Workspace | `workspace_projects`, `workspace_progress` |
| Game Design | `game_design_documents`, `game_design_validation_items` |
| Game Configuration | `game_configuration_records`, `game_configuration_validation_items` |
| Project Journey | `project_journey_note_types`, `project_journey_notes`, `project_journey_templates`, `project_journey_items`, `project_journey_activity` |
| Palette | `palette_colors`, `palette_source_swatches`, `palette_swatch_usages`, `project_workspace_palette_globals` |
| Asset | `asset_role_definitions`, `asset_library_items`, `asset_storage_objects`, `asset_import_events`, `asset_validation_items` |
| User Roles | `users`, `user_roles`, `roles` |
| Tool State Samples | `tool_state_samples` |
| Tool Metadata | `toolbox_tool_metadata` |
| Tool Planning | `toolbox_tool_planning` |
| Toolbox Votes | `toolbox_votes` |

## Active Table Inventory

| Table | Owner / Logical Group |
| --- | --- |
| `asset_import_events` | Asset |
| `asset_library_items` | Asset |
| `asset_role_definitions` | Asset |
| `asset_storage_objects` | Asset |
| `asset_validation_items` | Asset |
| `game_configuration_records` | Game Configuration |
| `game_configuration_validation_items` | Game Configuration |
| `game_design_documents` | Game Design |
| `game_design_validation_items` | Game Design |
| `palette_colors` | Palette |
| `palette_source_swatches` | Palette |
| `palette_swatch_usages` | Palette |
| `project_journey_activity` | Project Journey |
| `project_journey_items` | Project Journey |
| `project_journey_note_types` | Project Journey |
| `project_journey_notes` | Project Journey |
| `project_journey_templates` | Project Journey |
| `project_workspace_palette_globals` | Palette |
| `roles` | User Roles |
| `tool_state_samples` | Tool State Samples |
| `toolbox_tool_metadata` | Tool Metadata |
| `toolbox_tool_planning` | Tool Planning |
| `toolbox_votes` | Toolbox Votes |
| `user_roles` | User Roles |
| `users` | User Roles |
| `workspace_progress` | Workspace |
| `workspace_projects` | Workspace |

## Notes

- `toolbox_vote_order` is not an active adapter table today. Tool order is DB-owned as `toolbox_tool_metadata.order`.
- No underlying table ownership changed in this PR.
