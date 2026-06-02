# Project Workspace Runtime Contract

Date: 2026-06-02

## Purpose

Project Workspace is the runtime-only active working context for a Project.

## Rules

- Project Workspace is runtime-only.
- Project Workspace does not persist tool payloads.
- Project Workspace does not own saved tool state.
- Project Workspace does not duplicate project storage.
- Project Workspace does not duplicate tool state storage.
- Project Workspace recovery points to Tool State recovery.

## Runtime Fields

Project Workspace may track:

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
- Project Workspace = current runtime working context for the Project.
- Tool State = persisted DB record for one tool.
- Manifest = portable export/import format.

## Prohibited Storage

Project Workspace must not contain saved tool state records, tool payload data, project records, manifest data, database IDs, Project Workspace storage records, or Project Workspace-owned recovery state.
