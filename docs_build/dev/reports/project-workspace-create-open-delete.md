# Project Workspace Create Open Delete

Stack item: PR_26155_046-project-workspace-create-open-delete

## Summary
- Updated `toolbox/project-workspace/index.html` to keep the Theme V2 tool template shell while adding create, open, and delete controls.
- Added `toolbox/project-workspace/project-workspace.js` to drive the page from the mock repository.
- Single-user behavior uses `creator-user`; table shape remains multi-user-ready.

## Behavior
- Create Project adds a mock `projects` row and an Owner membership row.
- Open Project selects an existing mock project from the visible project list.
- Delete Open Project removes the active mock project and related membership rows, then opens the first remaining project when available.

## Constraints
- No page-local CSS, tool-local CSS, inline styles, inline scripts, or inline event handlers were added.
- No persistence, real save/load, auth, cloud, or Game Design implementation was added.
