# ProjectWorkspace Runtime Contract

Date: 2026-06-02

## Purpose

ProjectWorkspace is the runtime-only active working context for a Project.

## Rules

- ProjectWorkspace is runtime-only.
- ProjectWorkspace does not persist tool payloads.
- ProjectWorkspace does not own saved tool state.
- ProjectWorkspace does not duplicate project storage.
- ProjectWorkspace does not duplicate tool state storage.
- ProjectWorkspace recovery points to Tool State recovery.

## Runtime Fields

ProjectWorkspace may track:

- `activeProjectId`
- `activeToolId`
- `activeToolStateId`
- `dirty`
- `recoveryAvailable`
- `recoveryToolStateId`
- `activePaletteContext`
- `flowState`

## Data Ownership

- Project = persisted DB container.
- ProjectWorkspace = current runtime working context for the Project.
- Tool State = persisted DB record for one tool.
- Manifest = portable export/import format.

## Prohibited Storage

ProjectWorkspace must not contain saved tool state records, tool payload data, project records, manifest data, database IDs, ProjectWorkspace storage records, hidden persisted workspace state, sample JSON, fallback data, or ProjectWorkspace-owned recovery state.
