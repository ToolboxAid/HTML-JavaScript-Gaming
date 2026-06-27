# Project Journey Template SSoT Report

Generated: 2026-06-06

## Scope

- Migrated Project Journey mock data from entry-owned system meaning to item/template SSoT ownership.
- Added `project_journey_items` for project/user instance data.
- Added `project_journey_templates` for reusable system guidance, original meaning, linked tool contexts, versioning, and active state.
- Removed `originalMeaning`, `systemGuidance`, and `linkedToolContexts` from stored item records; resolved views attach those values from templates by `templateId`.
- Preserved system-created edit/no-delete behavior and user-created edit/delete behavior.

## Item And Template Rules

- System-created items resolve guidance from active templates.
- User-created items may have an empty `templateId`.
- System-created items can update status and Item Details only through user editing.
- System-created title and System Guidance stay template-owned.
- User-created items can update title, status, and Item Details.
- User edits set `updatedByType=user`.
- Mock system updates set `updatedByType=system`.
- Visible diagnostics report missing, inactive, or invalid template IDs for system-created items.

## UI Changes

- Selected Note Tree now renders compact tree rows with reusable Theme V2 `tool-tree-*` classes.
- Forge-bot and trash actions are 32x32 and aligned at the end of tree rows.
- Item Details renders directly below the selected item.
- System Guidance renders separately from editable Item Details for system-created items.
- Selected note Type dropdown is visible in Note Types and updates the selected note plus summary table immediately.
- Add Type prevents duplicate note type names and adds new names to the dropdown.

## Theme V2 Gap

This PR added reusable Theme V2 classes in `assets/theme-v2/css/panels.css` because the existing system had 16px swatches and larger display badges, but no reusable 32px end-of-row action/indicator class or compact tool-tree rhythm.

## Validation

- PASS: Targeted Project Journey data/runtime/UI lane.
- PASS: Project Workspace active-project handoff coverage in the Project Journey spec.
- PASS: Toolbox registration/navigation coverage.
- PASS: System guidance resolves from `project_journey_templates`.
- PASS: Template guidance is not editable by normal users.
- PASS: Item Details remains editable.
- PASS: User edits set `updatedByType=user`.
- PASS: Mock system updates set `updatedByType=system`.
- PASS: Missing, inactive, and invalid template IDs show visible diagnostics.
- PASS: User-created items work without `templateId`.
- PASS: System-created delete remains blocked; user-created delete remains confirmed/deletable.
- PASS: Selected note Type dropdown updates the note type and summary table.
- PASS: Add Note Type creates a selectable non-duplicate type.
- PASS: Forge-bot and trash controls are 32x32 and aligned at row end.
- PASS: Compact tree spacing is verified.
- PASS: Changed-file/static validation passed.
- SKIP: Full samples smoke was not run per BUILD instruction.
