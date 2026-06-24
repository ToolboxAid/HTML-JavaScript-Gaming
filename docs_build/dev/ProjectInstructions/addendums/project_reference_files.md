# Project Reference Files Governance

Status: Approved
Owner: OWNER

## Purpose

Define recognized project instruction and reference documents that may live outside the active `docs_build/dev/ProjectInstructions/` addendum tree but still belong in Project Instructions reviews.

## Recognized Files

The following files are valid project instruction/reference documents when present in `ProjectInstructions.zip`, `docs_build/dev/ProjectInstructions/`, or the project instruction/admin-notes directory:

- `Installs required.txt`
- `Table layout.txt`

Canonical repository locations:

- `docs_build/dev/admin-notes/Installs required.txt`
- `docs_build/dev/admin-notes/Table layout.txt`

## Review Rule

Future Project Instructions reviews must include these files automatically when they are present in either:

- an extracted `ProjectInstructions.zip` bundle
- the active project instruction directory
- `docs_build/dev/admin-notes/`

Treat these files the same as existing instruction documents for read-set, review, preservation, and reporting purposes.

Missing files are not a release-gate failure unless a PR explicitly scopes those files or claims they are present.

## Scope Boundary

This governance addendum does not introduce runtime behavior, UI behavior, application loading, or ZIP-generation changes.
