# PR_26158_040 Game Deploy Path Plan

## Purpose

Define the focused MVP path from an editable GameFoundryStudio project to one public playable URL. This PR is planning only; it does not implement runtime publish, deploy, schema, API, or UI behavior.

## Minimum End-To-End Path

Intentional workflow order:

1. Create/Load Project
2. Open Game Manifest
3. Validate Manifest
4. Save Project
5. Publish Candidate
6. Deploy Playable Game
7. Open Public Play URL

This order is a workflow-path exception to alphabetical navigation/list ordering because the request explicitly defines a deploy sequence.

## MVP Flow

| Step | User/System Action | MVP Result | Current State |
| --- | --- | --- | --- |
| Create/Load Project | Creator opens Project Workspace, creates or loads one game project. | Active project is known and persisted in DB with owner/role/audit fields. | Partially implemented. Project Workspace can create/open/delete local mock projects and shows project/publishing progress, but reports that public release promotion is not implemented. |
| Open Game Manifest | Creator opens the project manifest workspace for the active project. | DB-backed manifest record opens with source tool-state and source asset references. | Partially implemented as contracts/schema/runtime parser. No active first-class manifest workspace/runtime save path is wired to Project Workspace. |
| Validate Manifest | System validates manifest structure, references, asset readiness, and debug/public gates. | Blocking findings must be visible before save or publish candidate creation. | Partially implemented through `game.manifest.schema.json`, `manifestRuntimeParser.js`, `gameManifestContract.js`, `projectAssetValidation.js`, and packaging helpers. Missing integrated gate runner. |
| Save Project | Creator saves project, manifest, assets, and tool-state references through the server API. | Working DB state is authoritative and audit-owned. | Partially implemented for current tools through API/client paths and local DB work. Missing complete manifest/release save API path. |
| Publish Candidate | Creator creates a candidate from a validated manifest. | Candidate freezes source manifest/version, release metadata, asset snapshot, validation report, and status. | Contract-only. `releaseContract.js`, `publishContract.js`, and Publish wireframe exist; no connected candidate creation. |
| Deploy Playable Game | Server generates immutable playable artifacts and deploys to UAT/public storage. | Deploy record references candidate and artifact manifest; no browser-side artifact fabrication. | Pipeline helpers exist for packaging/export/cloud target summaries, but no server deploy endpoint or artifact writer is connected. |
| Open Public Play URL | Player opens a public URL for the deployed release. | URL serves the immutable playable bundle and does not require creator DB/session state. | Not implemented for generated user games. Archived/reference games and runtime manifest loading exist separately. |

## Current Implemented Pieces

| Area | Evidence | Reusable For MVP |
| --- | --- | --- |
| Project creation/opening | `toolbox/project-workspace/index.html`; `toolbox/project-workspace/project-workspace.js`; `src/dev-runtime/persistence/tool-repositories/project-workspace-mock-repository.js` | Use as creator entry point and active project handoff. |
| Game design readiness | `toolbox/game-design/index.html`; `toolbox/game-design/game-design.js` | Use as upstream project-owned authoring data. |
| Game configuration readiness | `toolbox/game-configuration/index.html`; `toolbox/game-configuration/game-configuration.js` | Use as upstream playable setup authoring data. |
| Project assets | `toolbox/assets/index.html`; `toolbox/assets/assets.js`; `src/shared/toolbox/projectAssetValidation.js` | Use asset records and validation findings as release blockers. |
| Manifest schema/runtime parser | `src/shared/schemas/game.manifest.schema.json`; `src/engine/runtime/manifestRuntimeParser.js` | Use for manifest structure and runtime-load acceptance. |
| Manifest DB contract | `src/shared/contracts/gameManifestContract.js`; `docs_build/dev/specs/GAME_MANIFEST_CONTRACT.md` | Use for DB record fields, ownership, visibility, version, and portable export boundary. |
| Release/publish contracts | `src/shared/contracts/releaseContract.js`; `src/shared/contracts/publishContract.js`; `src/shared/contracts/tools/publishStudioContract.js` | Use as candidate and publish record contract starting points. |
| Packaging/export/cloud helpers | `src/shared/toolbox/projectPackaging.js`; `src/shared/toolbox/multiTargetExport.js`; `src/shared/toolbox/cloudRuntime.js`; `src/shared/toolbox/publishingPipeline.js` | Use as deterministic package/export validation helpers, not as a complete deploy service. |
| Local API/data boundary | `src/engine/api/*`; `src/dev-runtime/server/mock-api-router.mjs`; Local Mem/Local DB work | Preserve Browser -> Server API -> Data Source for any future publish/deploy writes. |
| Debug public-release rule | `docs_build/dev/PROJECT_INSTRUCTIONS.md` debug settings rule | Must become a hard release gate. |

## Missing Pieces

| Missing Piece | Why It Blocks MVP |
| --- | --- |
| DB-backed game manifest records and API routes | Publish cannot reference a stable manifest version if the manifest is only portable JSON/runtime schema. |
| Manifest editor/open path for active Project Workspace project | The requested "Open Game Manifest" step needs a first-class route/tool or Project Workspace panel. |
| Manifest assembly from project/tool state/assets | The system needs one deterministic source for building manifest payloads from DB-owned project data. |
| Integrated manifest validation gate | Existing validators are not yet one server/API gate that reports manifest, asset, debug, publish, and public-readiness findings. |
| Save Project transaction boundary | Project, manifest, tool-state references, and asset references need a server-side transaction or equivalent atomic write contract. |
| Publish candidate record/table/API | Release/publish contracts exist, but there is no candidate creation endpoint, lifecycle table, or UI action. |
| Immutable deploy artifact writer | No UAT artifact writer currently creates a playable bundle from a candidate. |
| Public play route resolver | No route maps a published candidate/deploy record to a stable public playable URL. |
| UAT deploy storage/serving contract | UAT needs a defined storage root, URL base, cache policy, and artifact manifest format. |
| Debug stripping/rejection implementation | Public playable release must fail if debug settings are enabled, or must strip them in a documented way. |

## Blockers

| Blocker | Resolution Needed |
| --- | --- |
| Working DB and portable manifest are not unified by an active manifest service. | Add a server-side manifest service that reads DB state, validates it, and emits portable JSON only as an artifact/export. |
| Publish page is currently a wireframe. | Add a future Publish Candidate workflow after manifest service exists. |
| Generated playable artifact format is undefined. | Define a minimal artifact manifest and static bundle layout before deploy implementation. |
| Public URL authorization/visibility transition is undefined. | Release visibility and publish status must determine public route exposure. |
| Asset binary persistence is incomplete. | MVP may deploy only assets already available by stable repo/server paths; user-uploaded binary persistence must be blocked or diagnosed until available. |
| UAT environment storage is not declared in code. | Add UAT deploy config in a later PR before writing artifacts. |

## DB Versus Generated Deploy Artifacts

| Data | DB Source Of Truth | Generated Deploy Artifact |
| --- | --- | --- |
| Project identity, owner, members, purpose, status | Yes: project tables with audit and permissions. | Include public display copy only when required by release metadata. |
| Tool state and authoring records | Yes: DB records per tool/project. | Include only normalized runtime payloads required by the playable bundle. |
| Game manifest working record | Yes: manifest record, version, status, visibility, source references, validation status. | `game.manifest.json` snapshot for the release candidate. |
| Source asset records | Yes: asset records, ownership, storage path, metadata, dependency graph, validation findings. | Copied or referenced runtime assets with content/version metadata. |
| Release candidate | Yes: candidate/release record, source manifest, version, validation report, status. | Candidate manifest/report copied into release bundle for provenance. |
| Publish record | Yes: public/unlisted/private visibility, publishedAt, source release, status. | Public route manifest may include publish key and public metadata only. |
| Deploy job/result | Yes: deploy job, target, artifact root, URL, status, diagnostics. | Deployment manifest and immutable static files. |
| Audit fields, roles, permissions, private diagnostics | Yes only. | Must not be included in public artifacts. |
| Debug settings | DB may retain creator/debug config. | Public artifacts must strip or reject enabled debug-only settings. |
| Public play URL | DB stores canonical route/deploy mapping. | Static artifact is served at the URL but does not decide authorization. |

## Required UAT Deployment Path For One Playable Game

MVP UAT should support one validated playable game end to end:

1. UAT user logs in with a creator/admin role that can edit the project.
2. User opens Project Workspace and loads one Game Project.
3. User opens the Game Manifest view for that project.
4. Server builds or opens the latest manifest record from DB-owned project/tool/asset state.
5. Server runs validation gates and returns a blocking/non-blocking report.
6. User saves the project/manifest only if blocking findings are zero.
7. User creates a Publish Candidate from the validated manifest.
8. Server freezes source manifest version, asset snapshot, validation report, release metadata, and candidate status.
9. User promotes candidate to UAT deploy.
10. Server generates artifacts under a UAT deploy root, for example `uat-deploy/games/<gameSlug>/<releaseVersion>/`.
11. Server writes at minimum:
    - `index.html` or launch shell
    - `game.manifest.json`
    - runtime asset files or stable runtime references
    - `deploy-manifest.json`
    - `validation-report.json`
12. Server creates/updates a deploy record with a URL such as `/play/<gameSlug>/<releaseVersion>/`.
13. User opens the public play URL in a new browser context.
14. Public play route serves the immutable artifact without requiring creator session state.
15. UAT smoke verifies load success, manifest parse success, required assets resolve, debug mode is absent, and no private DB/audit fields leak.

## Validation Gates

| Gate | Blocking Conditions | MVP Evidence |
| --- | --- | --- |
| Manifest structure | Missing `schema`, invalid `version`, missing `game`, missing `launch.directPath`, malformed `tools`, unsupported extra root fields. | `manifestRuntimeParser.js`; `game.manifest.schema.json`; future server manifest gate report. |
| Manifest DB contract | Missing manifest owner/project/type/version/status/export format, invalid project type, invalid source tool-state or asset references. | `gameManifestContract.js`; future DB-backed manifest record validation. |
| Asset readiness | Missing asset IDs, unresolved palette/tile/vector/image links, duplicate registry IDs, invalid dependency graph, unavailable binary/runtime paths. | `projectAssetValidation.js`; future deploy gate must include all blocking findings. |
| Debug settings | Any public/playable candidate contains enabled debug-only settings, debug overlays, dev-only API endpoints, or test-only flags. | `PROJECT_INSTRUCTIONS.md` rule; future gate must reject or strip with explicit report. |
| Save Project | Active project missing, user cannot edit project, transaction fails, source records changed during save, audit fields invalid. | Future server API save transaction; DB viewer can help inspect Local/UAT state. |
| Publish state | Candidate references non-validated manifest, release version invalid, visibility invalid, publish status transition invalid, source release not publishable. | `releaseContract.js`; `publishContract.js`; future candidate API. |
| Deploy artifact | Package root missing, no runtime launch shell, missing `game.manifest.json`, missing asset, artifact manifest invalid, artifact write failed. | `projectPackaging.js`; `multiTargetExport.js`; future UAT deploy writer. |
| Public play readiness | URL not mapped to published deploy, route requires creator session, manifest fails runtime parse, assets 404, debug enabled, private DB fields present. | Future public route smoke. |

## MVP Implementation Order For Future PRs

1. Manifest service contract: server-side read/build/validate manifest for active project.
2. Manifest DB table/API: save versioned manifest records with audit and source references.
3. Publish Candidate API: create candidate from validated manifest and release metadata.
4. UAT deploy artifact contract: define output layout and `deploy-manifest.json`.
5. UAT deploy writer: generate one static playable artifact bundle from one candidate.
6. Public play route: serve one UAT deployed release by stable URL.
7. Public readiness smoke: validate no debug/private fields and all assets resolve.

## Non-Goals For This PR

- No publish runtime implementation.
- No deploy endpoint.
- No DB schema migration.
- No UAT storage configuration.
- No Playwright or sample smoke execution.
- No changes to `start_of_day` folders.

## Requirement Checklist

| Requirement | Result |
| --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS |
| Create focused MVP game deploy path plan. | PASS |
| Define minimum end-to-end path. | PASS |
| Identify implemented pieces. | PASS |
| Identify missing pieces and blockers. | PASS |
| Identify DB-owned data versus generated deploy artifacts. | PASS |
| Define required UAT deployment path for one playable game. | PASS |
| Define validation gates for manifest, assets, debug settings, publish state, and public play readiness. | PASS |
| Do not implement runtime publish behavior. | PASS |
| Do not modify `start_of_day` folders. | PASS |
