# Project Lifecycle Model

## Status

This is a planning document for GameFoundryStudio project lifecycle behavior.

It defines intended project states, ownership roles, visibility modes, and platform relationships before database, authentication, Admin, Account, publishing, marketplace, or runtime implementation begins.

This document does not authorize runtime changes, database implementation, authentication implementation, page changes, CSS changes, JavaScript changes, or schema migrations.

## Project Purpose

A Project is the working container for creator activity.

Projects organize tool states, assets, palettes, manifests, releases, and marketplace outputs under one ownership and visibility boundary. Projects should become the durable workspace layer between users and portable export/import artifacts.

## Project States

| State | Meaning | Editable | Shareable | Notes |
| --- | --- | --- | --- | --- |
| Draft | Early project state before active work or sharing begins. | Yes | No by default | Used for newly created projects and private experiments. |
| Active | Normal working state for an in-progress project. | Yes | According to visibility | Most creator work should happen here. |
| Archived | Preserved but inactive project state. | Limited | According to visibility | Restorable when policy allows; not the default editing state. |
| Published | Project has produced at least one release. | Yes for project, not for immutable release snapshots | Yes | Published state does not make all project internals public. |
| Marketplace | Project has produced marketplace content or listing-ready content. | Yes for project, controlled for listing content | Marketplace or moderated | Marketplace content may have stricter review, licensing, and visibility rules. |
| Retired | Project is no longer active, discoverable, or supported as current content. | No by default | Limited or hidden | Retired projects may keep audit, ownership, and historical references. |

## Project State Rules

- Draft can move to Active.
- Active can move to Archived.
- Archived can move back to Active when ownership and permissions allow.
- Active can move to Published when a valid Game Manifest and release workflow exist.
- Published can move to Marketplace when marketplace content is created and approved.
- Published or Marketplace projects can move to Retired.
- Retired projects should not silently delete related Tool States, Assets, Palettes, Game Manifest records, Releases, or Marketplace Items.
- State changes should be explicit database events in a future implementation.

## Project Ownership

| Role | Meaning | Expected Permissions |
| --- | --- | --- |
| Owner | Primary accountable user or organization for the project. | Manage project settings, ownership, collaborators, visibility, exports, releases, and marketplace actions subject to policy. |
| Collaborator | Authorized project participant. | Read and edit project data according to assigned project permissions. Publishing or marketplace permissions must be explicit. |
| Viewer | Authorized read-only participant. | View project content allowed by visibility and project policy; cannot edit, publish, or manage collaborators. |

## Project Ownership Rules

- Every Project must have an Owner.
- Projects may have Collaborators.
- Projects may have Viewers.
- Collaborator and Viewer access must be explicit.
- Ownership transfer must be explicit and audited.
- A Project Owner does not automatically own every external object referenced by the project.
- Project-owned child objects inherit project ownership unless the object model explicitly promotes separate ownership.

## Project Visibility

| Visibility | Meaning | Discovery |
| --- | --- | --- |
| Private | Visible only to the Owner and explicitly authorized participants. | Not discoverable. |
| Project | Visible to project participants according to project permissions. | Not public; discoverable only inside the project context. |
| Unlisted | Accessible by explicit link or direct association when policy allows. | Not listed in public discovery. |
| Public | Visible and discoverable to public users. | Discoverable through public platform surfaces. |

## Project Visibility Rules

- Every shareable Project must have an explicit visibility value.
- Visibility must not be inferred from missing data.
- Private projects must not expose child objects through public links unless those child objects are separately shared and policy allows it.
- Public visibility applies to the project surface, not automatically to every working Tool State, Asset, Palette, or internal record.
- Marketplace visibility is not a Project visibility mode; it is a produced listing/content state that depends on Marketplace Item records.

## Project Relationships

Project relationships define how platform objects attach to or derive from a Project.

Required relationship categories:
- Tool States
- Assets
- Palettes
- Game Manifest
- Releases
- Marketplace Items

Relationship rules:
- Project -> contains Tool States.
- Project -> contains Assets.
- Project -> contains Palettes.
- Project -> contains Game Manifest.
- Project -> may produce Releases.
- Project -> may produce Marketplace content.

## Relationship Model

| Relationship | Ownership | Lifecycle Behavior | Export Behavior |
| --- | --- | --- | --- |
| Project -> Tool States | Project-owned unless explicitly promoted. | Tool States follow project state for editability; Archived or Retired projects limit editing. | Exportable as toolState JSON when permissions allow. |
| Project -> Assets | Project-owned by default, with possible external references. | Assets remain attached through Draft, Active, Archived, Published, Marketplace, and Retired states unless removed or rights change. | Exportable as allowed asset files, metadata JSON, or project package entries. |
| Project -> Palettes | Project-owned or asset-linked. | Palettes can support tool states, assets, and manifests across project states. | Exportable as palette JSON and manifest/project dependencies. |
| Project -> Game Manifest | Project-owned working game definition. | Game Manifest becomes release input when publishing begins. | Exportable as the portable game configuration format. |
| Project -> Releases | Derived from Project and Game Manifest. | Releases should be immutable or versioned snapshots once published. | Exportable as release metadata plus manifest/package data when rights allow. |
| Project -> Marketplace Items | Derived from Project, Assets, Game Manifest, Release, or Community Content. | Marketplace Items require listing visibility, moderation, and rights checks. | Exportable as listing metadata and allowed item references. |

## State And Relationship Expectations

Draft:
- May contain Tool States, Assets, Palettes, and a Game Manifest.
- Should not produce Releases or Marketplace Items by default.

Active:
- May contain editable Tool States, Assets, Palettes, and a Game Manifest.
- May prepare Releases.
- May prepare Marketplace content.

Archived:
- Retains Tool States, Assets, Palettes, Game Manifest, Releases, and Marketplace Items.
- Editing is limited until restored to Active.

Published:
- Must have produced at least one Release.
- May continue editing the working Project while preserving release snapshots.

Marketplace:
- Must have produced Marketplace content or an approved Marketplace Item.
- May also be Published.
- Marketplace listing state should not replace Project visibility.

Retired:
- Retains historical relationships.
- Should restrict editing and public discovery unless policy allows historical visibility.

## Database And Export Direction

Database behavior:
- The database is the working system for Project records, ownership, visibility, permissions, state, and relationships.
- The database should track state transitions and relationship changes explicitly.

Portable format behavior:
- Manifest/JSON remains the portable export/import format.
- Project exports should include portable Tool States, Assets, Palettes, Game Manifest data, Release metadata, and Marketplace metadata only when permissions and rights allow.
- Project imports should create new ownership under the importing user or project context.
- Imports must not assume original database ids.

## Non-Goals

This document does not:
- define SQL schema
- define API routes
- implement project persistence
- implement authentication
- implement authorization checks
- implement Admin pages
- implement Account pages
- implement publishing
- implement marketplace behavior
- change runtime behavior
- change CSS, HTML, JavaScript, TypeScript, or JSON files
