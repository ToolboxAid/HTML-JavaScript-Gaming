# Development Workspace

This folder is the destination shell for non-deployable development workspace material.

## Ownership

- Root remains reserved for production/public product sections and standard repository configuration.
- `src/` remains deployable application code.
- `dev/` contains non-deployable build, test, bootstrap, governance, report, and local workspace material.
- `docs/` stays at root for production Docs & Help.
- `games/` stays at root for public game discovery.
- `toolbox/` stays at root for the Creator toolbox/workspace.

## Governance Workspace

- `dev/docs_build/` owns active development governance, PR workflow material, and generated reports.
- `dev/archive/` owns historical development reference material.
- `dev/project-instructions/` is deprecated reference only; active Project Instructions live under `dev/docs_build/dev/ProjectInstructions/`.

## Data Boundary

Creator data must not write to repository folders. Creator metadata must flow through the API to Postgres, and Creator assets must flow through the API to Cloudflare R2.
