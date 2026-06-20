# PR_26171_059 Validation Report

## Scope

Validation is docs/static only for this rollback restore plan PR.

Implementation validation is intentionally deferred until each approved restore item is reapplied in its own scoped PR from clean `main`.

## Commands

- `git status --short --branch`
  - PASS: starting branch was `main`.
  - PASS: leftover PR_26171_057 local-only report artifacts were removed before branching.
  - PASS: PR branch was created from clean latest `main`.
- `git pull --ff-only origin main`
  - PASS: local `main` fast-forwarded to `20fd280c608917b960b3080484a5d28c51990ccb`.
- `npm run test:playwright:static`
  - PASS: static-only validation completed successfully.
  - Note: the command refreshed generated validation reports; those generated report changes were restored because they are unrelated to this rollback plan PR.
- `git diff --check`
  - PASS: no whitespace errors.

## Not Run

- `npm run dev:local-api`
- `npm run test:workspace-v2`
- Runtime sign-in validation
- Text To Speech runtime validation
- Toolbox image runtime validation
- Game Journey runtime validation

These commands are intentionally out of scope for this docs/static rollback plan PR.
