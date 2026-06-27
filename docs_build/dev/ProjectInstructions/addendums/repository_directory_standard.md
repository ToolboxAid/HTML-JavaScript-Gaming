# Repository Directory Standard

Status: Approved
Owner: OWNER

## Purpose

Define the target repository directory ownership model before the development workspace restructure chain begins.

This document is governance only. It does not move runtime, UI, API, tests, or production files by itself.

## Directory Ownership

- Repository root contains production/public product sections and standard repository configuration.
- `src/` contains deployable application code.
- `dev/` contains non-deployable build, test, bootstrap, governance, report, and local workspace items.
- `docs/` remains at root because it is production Docs & Help.
- `games/` remains at root because it is public game discovery.
- `toolbox/` remains at root because it is the Creator toolbox/workspace.

## Creator Data Boundary

- Creator data must not write to repository folders.
- Creator metadata must go through the API to Postgres.
- Creator assets must go through the API to Cloudflare R2.
- Repo folders may contain fixtures, templates, governance, and development artifacts only when they are not Creator-owned production data.

## Environment And Runtime Rules

- Postgres is the only active runtime database.
- The same application code path must run across LOCAL, DEV, IST, UAT, and PROD.
- Environment differences must come from `.env` values or environment-managed secrets.
- Runtime source filenames must not use team names.

## PR Chain Boundary

The development workspace restructure must proceed through sequential scoped PRs. A PR may only move or update the paths named in its purpose.
