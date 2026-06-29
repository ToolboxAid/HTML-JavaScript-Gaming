# PR_26180_OWNER_015 Root Empty Folder and src Transition Audit

## Executive Summary

PR_26180_OWNER_015 completes a no-runtime-change audit of named root leftovers after the `www/`, `api/`, and `dev/` migration. No tracked placeholder folders were removed because Git has no tracked content in the named root leftovers except `src/`.

`src/` remains active and tracked. It should not move in this PR because it contains deployable engine/runtime/shared modules and browser API clients still referenced by `www/`, `api/`, `dev/tests/`, and `dev/tools/`.

## Root Folder Audit

| Folder | Exists Locally | Tracked Content | Local/Generated Status | Decision |
|---|---:|---:|---|---|
| `assets/` | Yes | 0 tracked files | Contains ignored local `assets/DemoGame-26168-001.gfsp`; remaining entries are local directory shells. | Do not delete in PR. User/local cleanup only unless Owner explicitly approves moving/removing the ignored file. |
| `games/` | Yes | 0 tracked files | Empty local directory shell. | Do not delete in PR because it is untracked/local-only; safe local cleanup may remove it outside a commit. |
| `learn/` | Yes | 0 tracked files | Empty local directory shell. | Do not delete in PR because it is untracked/local-only; safe local cleanup may remove it outside a commit. |
| `src/` | Yes | 596 tracked files | Active transition namespace. | Keep. Requires explicit follow-up migration PRs. |
| `test-results/` | No | 0 tracked files | Absent. | No action. |
| `tmp/` | Yes | 0 tracked files | Empty local directory shell. | Do not use for Codex output; canonical ZIPs remain under `dev/workspace/zips/`. |
| `toolbox/` | Yes | 0 tracked files | Empty local directory shell. | Do not delete in PR because it is untracked/local-only; safe local cleanup may remove it outside a commit. |

## Required Confirmations

- `.env` remains root/local-only and ignored by `.gitignore`.
- `.env.example` remains tracked as the repository template.
- `www/favicon.svg` remains the browser-served favicon.
- No runtime behavior changes were made.
- No product feature changes were made.

## src Transition Plan

| Current Area | Tracked Files | Why It Remains | Destination | Proposed Follow-Up |
|---|---:|---|---|---|
| `src/advanced/` | 10 | Advanced state and promotion logic remains actively tested/referenced. | `src/runtime/advanced/` or another Owner-approved runtime bucket. | Runtime transition PR for advanced state modules. |
| `src/api/` | 20 | Browser API clients and browser admin/client helpers remain used by `www/` and tests. Browser clients must stay outside top-level `api/`. | `src/web/api-clients/` or `src/runtime/api-clients/`, depending on final source-layer naming. | Browser API client source-layer migration PR. |
| `src/dev-runtime/admin/` | 4 | Legacy Admin Notes browser-viewer compatibility path is documented in Project Instructions. | `www/admin/` if browser-served, or retire after replacement. | Scoped Admin Notes compatibility retirement PR. |
| `src/engine/` | 327 | Core game/runtime engine remains heavily referenced by tests and dev tooling. | `src/runtime/engine/`. | Engine source-layer migration PR. |
| `src/shared/` | 233 | Shared contracts, utilities, random/hash/noise/geometry/color/text/time helpers, and toolbox pipeline logic remain actively referenced. | Split by usage: `src/runtime/shared/`, `src/web/shared/`, and/or `src/api-runtime/shared/`. | Shared source-layer classification and migration PR. |
| `src/tools/` | 2 | Tool helper modules remain referenced by current tooling/tests. | `src/web/tools/` or `src/runtime/tools/` after ownership review. | Tool helper source-layer migration PR. |

## Follow-Up Recommendation

Do not move `src/` wholesale. Create focused source-layer migration PRs after the layout stack is merged:

1. Browser API clients and browser helper modules.
2. Engine/runtime modules.
3. Shared contracts/utilities classification.
4. Legacy Admin Notes compatibility retirement.
5. Tool helper modules.

## Scope Boundary

This PR is audit/governance/reporting only. It does not move `src/`, delete local-only root folders, change runtime behavior, change product features, or alter API/database behavior.
