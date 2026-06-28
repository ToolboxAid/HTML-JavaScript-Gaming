# Project Type Contract

## Status

This is a contract planning document for GameFoundryStudio Project Type behavior.

It defines project type rules for persisted Project records before database, authentication, UI, runtime, publishing, marketplace, or storage implementation begins.

This document does not authorize runtime changes, database implementation, authentication implementation, page changes, CSS changes, HTML changes, JavaScript changes, or schema migrations.

## Project Type Values

Approved first-pass Project Types:

- `game`
- `asset-pack`
- `music-pack`
- `localization-pack`
- `template`
- `tutorial`

## Required Rules

- Every Project requires a `projectType`.
- Project is always the persisted ownership container.
- Project Type determines expected outputs, not ownership behavior.
- All Project Types share the same ownership model.
- All Project Types share the same visibility model.
- All Project Types share the same permissions model.
- All Project Types share the same lifecycle model.
- All Project Types share the same ProjectWorkspace runtime-only model.

## Expected Outputs

| Project Type | Expected Outputs |
| --- | --- |
| `game` | Game Manifest, Release |
| `asset-pack` | Asset outputs |
| `music-pack` | Audio outputs, MIDI outputs |
| `localization-pack` | Translation outputs |
| `template` | Reusable starter content |
| `tutorial` | Learning or community content |

## Ownership Boundary

Project Type does not create a separate ownership container.

The Project remains the persisted ownership container for Project data, Tool States, project-owned assets, Game Manifest records, Releases, Marketplace Items, and other future child records unless a later object contract explicitly promotes separate ownership.

## Visibility And Permissions Boundary

Project Type does not bypass visibility or permissions.

Private Projects remain private regardless of type.

Collaborators, Viewers, Owners, Admins, Moderators, Reviewers, Players, and Guests continue to use the approved Identity/Permissions and Project contract rules.

## ProjectWorkspace Boundary

ProjectWorkspace remains runtime-only for every Project Type.

ProjectWorkspace may track active project, active tool, active tool state, dirty status, recovery availability, active palette context, and open/close/save flow state.

ProjectWorkspace does not persist tool payloads, own saved Tool State, duplicate Project storage, or create a separate Project Type storage model.

## Non-Goals

This document does not:

- define SQL schema
- define API routes
- implement project persistence
- implement authentication
- implement authorization checks
- implement ProjectWorkspace storage
- implement Admin pages
- implement Account pages
- implement publishing
- implement marketplace behavior
- change runtime behavior
- change CSS, HTML, JavaScript, TypeScript, or JSON files outside the contract/test scope
