# SSoT Ideas Captured

PR: PR_26159_047-capture-ssot-notes-delete-branch
Generated: 2026-06-08
Source branch: `origin/PR_26151_004-gamefoundry-site-structure-ssot`
Source head before deletion: `0aee05215`
Runtime behavior changed: No
Playwright impacted: No

## Scope

This report captures useful product and IA ideas from the old SSoT branch before deletion. It intentionally does not merge, cherry-pick, or copy old implementation code.

Do not reuse from the old branch:

- `GameFoundryStudio/assets/css/*`
- `GameFoundryStudio/assets/partials/*`
- `GameFoundryStudio/assets/js/gamefoundry-partials.js`
- old `GameFoundryStudio/` path structure as an implementation location
- old `docs/dev/*` workflow artifacts

Future implementation should rebuild surviving ideas through current root paths, Theme V2, current header/session behavior, current toolbox registry/data contracts, and current `docs_build/dev/reports/*` workflow.

## Branch Context

- Behind main before deletion: 339
- Ahead of main before deletion: 39
- Unique changed files before deletion: 38
- Main difference: old standalone `GameFoundryStudio/` page tree and old CSS/partial structure versus current root pages plus `assets/theme-v2`.

## Public Destinations

### Cloud

Useful idea to preserve:

- Treat Cloud as a first-class public destination for project storage, sync, version management, and release support.
- Position Cloud as the bridge between local tools and connected creator workflows.
- Possible future page goals:
  - show saved projects and assets
  - show sync/storage status
  - explain Local Mem / Local DB / future hosted storage boundaries
  - link to publishing readiness when deploy work begins

Modern rebuild note:

- Rebuild as a Theme V2 root page if Cloud becomes current product scope.
- Do not reuse old `GameFoundryStudio/cloud/index.html` or old CSS.

### Publish

Useful idea to preserve:

- Treat Publish as the creator path from project to playable public page.
- Preserve the product concept of release versions, previews, metadata, readiness checks, analytics, rollback safety, and Arcade handoff.
- Possible future page goals:
  - publish candidate checklist
  - manifest validation gate
  - asset readiness gate
  - debug/release mode gate
  - public play URL readiness

Modern rebuild note:

- Rebuild only after publish/deploy data contracts are scoped.
- Align with `docs_build/dev/reports/game-deploy-path-plan-report.md` rather than the old static page.

### Docs

Useful idea to preserve:

- Treat Docs as a public/creator-facing learning destination for manifests, tools, validation rules, publishing, and platform architecture.
- Suggested content buckets:
  - Manifest Guide
  - Tool Guides
  - Publishing Rules
  - Validation Rules

Modern rebuild note:

- Rebuild as current documentation IA if product docs become in-scope.
- Keep dev/admin docs under `docs_build/dev/`; keep public docs separate from internal reports.

## Tool Builder / Tool Creator / Tool Publisher

### Tool Builder

Useful idea to preserve:

- A first-class tool-planning surface for building new tools or tool layouts.
- Old branch concept used left/center/right regions and accordion panels.
- Possible modern interpretation:
  - tool template checklist
  - required file scaffold checklist
  - Theme V2 compliance checklist
  - toolbox registration checklist

Modern rebuild note:

- Rebuild only through current first-class tool rules and `toolbox/_tool_template-v2` patterns.
- Do not copy the old one-file HTML layout.

### Tool Creator

Useful idea to preserve:

- A guided creator/editor surface for defining tool behavior and user-facing workflow.
- Possible modern interpretation:
  - tool purpose
  - input/setup panel plan
  - center work-surface plan
  - right diagnostics/status plan
  - validation lane plan

Modern rebuild note:

- Rebuild as a new small PR only after the intended data source and registry contract are clear.

### Tool Publisher

Useful idea to preserve:

- A publishing/readiness surface for promoting a tool from concept to available Toolbox entry.
- Possible modern interpretation:
  - readiness status
  - required tests
  - registry visibility
  - screenshots/docs
  - role/access notes

Modern rebuild note:

- Rebuild around current toolbox metadata/status model, not static old pages.

## Tool Group Landing Page Concepts

Useful group concepts to preserve as IA:

- Building / Creation
- Technology / System
- Assets / Content
- Media / Community
- Design / Animation
- Configuration / Admin

Useful pattern:

- Each group page explains the group purpose.
- Each group links to related tools and destinations.
- Group pages can help users browse by workflow rather than by tool name alone.

Modern rebuild note:

- Rebuild group pages from current toolbox registry/category data.
- Avoid static duplicated lists.
- Do not copy old group HTML or old meaning color CSS.
- Respect current Admin/My Stuff and role-aware navigation rules.

## Account Branding / Controls

### Branding

Useful idea to preserve:

- A brand reference page for colors, mascot roles, and visual identity.
- Branch examples included brand color names and mascot descriptions.
- Possible future use:
  - internal brand system page
  - admin-only design reference
  - public brand page if product marketing needs it

Modern rebuild note:

- Rebuild through Theme V2 tokens and current asset paths.
- Do not copy old brand swatch CSS or old mascot page markup.

### Controls

Useful idea to preserve:

- A controls/reference page showing common form controls with foundry-style grouping.
- Possible future use:
  - Theme V2 design-system reference
  - admin-only design QA page
  - reusable controls documentation

Modern rebuild note:

- Rebuild as Theme V2 design-system documentation if needed.
- Do not copy old page-local control CSS.

## Recommended Future PR Slices

1. Public destination planning PR:
   - decide whether Cloud, Publish, and Docs are current product pages
   - define root paths and navigation ownership

2. Publish readiness PR:
   - connect Publish concepts to manifest, asset, debug, candidate, deploy, and public URL gates

3. Toolbox IA PR:
   - map Tool Builder / Tool Creator / Tool Publisher concepts to current toolbox registry/status data

4. Tool group PR:
   - derive group landing pages from current toolbox metadata

5. Theme V2 design-system docs PR:
   - decide whether Branding and Controls belong under Admin, Account, or public docs

## Final Recommendation

Delete the old SSoT branch after this capture report. Its useful ideas are now documented, while its implementation path is obsolete under current Theme V2, current root page organization, local API/session work, and toolbox registry direction.

## Validation Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Capture Public destinations: Cloud, Publish, Docs. | PASS | See `Public Destinations`. |
| Capture Tool Builder / Tool Creator / Tool Publisher concepts. | PASS | See `Tool Builder / Tool Creator / Tool Publisher`. |
| Capture tool group landing page concepts. | PASS | See `Tool Group Landing Page Concepts`. |
| Capture Account Branding / Controls concepts. | PASS | See `Account Branding / Controls`. |
| Do not merge old code. | PASS | No merge command was run. |
| Do not cherry-pick old code. | PASS | No cherry-pick command was run. |
| Do not copy old CSS/partials/JS. | PASS | Report captures concepts only and explicitly rejects old implementation paths. |
