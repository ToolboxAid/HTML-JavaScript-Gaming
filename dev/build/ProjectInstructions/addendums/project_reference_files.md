# Project Reference Files Governance

Status: Approved
Owner: OWNER

## Purpose

Define recognized project instruction and reference documents that may live in the active `dev/build/ProjectInstructions/` tree or in root `dev/archive/` reference material but still belong in Project Instructions reviews.

## Recognized Files

The following files are valid project instruction/reference documents when present in `ProjectInstructions.zip`, `dev/build/ProjectInstructions/`, or the archived project instruction/admin-notes reference tree:

- `Installs required.txt`
- `Table layout.txt`

Canonical repository reference locations:

- `dev/archive/docs_build/dev/admin-notes/Installs required.txt`
- `dev/archive/docs_build/dev/admin-notes/Table layout.txt`

## Review Rule

Future Project Instructions reviews must include these files automatically when they are present in either:

- an extracted `ProjectInstructions.zip` bundle
- the active project instruction directory
- `dev/archive/docs_build/dev/admin-notes/`

Archived reference files are not active governance. If they conflict with active Project Instructions, `dev/build/ProjectInstructions/` wins unless OWNER explicitly approves a newer governance change.

Treat these files the same as existing instruction documents for read-set, review, preservation, and reporting purposes.

Missing files are not a release-gate failure unless a PR explicitly scopes those files or claims they are present.

## Scope Boundary

This governance addendum does not introduce runtime behavior, UI behavior, application loading, or ZIP-generation changes.
