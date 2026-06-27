# PR_26172_CHARLIE_013 Tool JS/CSS Canonical Migration Audit

## Purpose

Use prior Charlie audits to identify the next five safest tool migrations into the canonical structure.

Reviewed areas:

- `toolbox/`
- `assets/toolbox/`
- `assets/theme-v2/`

## Executive Summary

| Check | Status | Result |
| --- | --- | --- |
| Tool JS outside canonical locations | FAIL | Legacy toolbox JS sidecars remain under `toolbox/{tool}/`. |
| Tool CSS outside canonical locations | PASS | No active toolbox CSS sidecars were found in the reviewed tool paths. |
| Inline script violations | PASS | Reviewed active tool index pages do not use inline `<script>` blocks. |
| Inline style violations | PASS | Reviewed active tool index pages do not use inline `<style>` blocks or `style=` attributes. |
| Migration candidates ranked | PASS | Five lowest-risk candidates are listed below. |

## Candidate Ranking Method

Candidates were ranked by:

1. lowest behavior risk;
2. fewest files;
3. fewest active references.

Reference counts exclude `archive/`, generated report history, `tmp/`, and `node_modules/`.

## Recommended Next Five Tool Migrations

| Rank | Tool | Current Non-Canonical Files | Active Reference Count | Canonical Target | Risk | Notes |
| ---: | --- | --- | ---: | --- | --- | --- |
| 1 | Text To Speech | `toolbox/text-to-speech/text2speech.js` | 4 | `assets/toolbox/text-to-speech/js/index.js` | Lowest | One tool JS file, one tool page script reference, and one direct active test import. |
| 2 | Tags | `toolbox/tags/tags.js`, `toolbox/tags/tags-api-client.js` | 5 | `assets/toolbox/tags/js/index.js` | Low | Smallest two-file tool; consolidate API wrapper into canonical entrypoint to satisfy the current guardrail. |
| 3 | Game Configuration | `toolbox/game-configuration/game-configuration.js`, `toolbox/game-configuration/game-configuration-api-client.js` | 5 | `assets/toolbox/game-configuration/js/index.js` | Low/Medium | Two files and low reference count; validation overlay behavior should be checked after Tags. |
| 4 | Colors | `toolbox/colors/colors.js`, `toolbox/colors/palette-api-client.js` | 5 | `assets/toolbox/colors/js/index.js` | Medium | Color/palette behavior is broader than Tags, but still has few references. |
| 5 | Objects | `toolbox/objects/objects.js`, `toolbox/objects/objects-api-client.js` | 6 | `assets/toolbox/objects/js/index.js` | Medium | Object tool touches engine object-model and asset repository behavior; migrate after simpler API-backed tools. |

## Deferred Candidates

| Tool | Reason Deferred |
| --- | --- |
| Controls | Active references include account/user control pages and Playwright source fetch assertions. |
| Game Hub | Shared root toolbox accordions import `game-hub-api-client.js`; defer until root toolbox script migration strategy is scoped. |
| Game Journey | Prior validation showed a pre-existing `/api/game-journey/completion-metrics` 500 from legacy preservation behavior; defer until owner accepts that risk. |
| Assets | Includes a worker script and upload behavior; more than one runtime asset path must be preserved. |
| Messages | Three files and TTS service registry dependency make it higher risk than the first five. |

## Inline Script And Style Review

| Area | Status | Notes |
| --- | --- | --- |
| `toolbox/` active tool pages | PASS | Tool pages use external Theme V2 scripts and module script references. |
| `assets/toolbox/` | PASS | Existing canonical Idea Board JS is already under `assets/toolbox/idea-board/js/index.js`. |
| `assets/theme-v2/` | PASS | Theme V2 JS/CSS live under approved theme asset paths. |

## Recommended Execution Order

1. `PR_26172_CHARLIE_014-low-risk-tool-migration-1`: migrate Text To Speech.
2. `PR_26172_CHARLIE_015-low-risk-tool-migration-2`: migrate Tags.
3. Future Charlie PR: migrate Game Configuration.
4. Future Charlie PR: migrate Colors.
5. Future Charlie PR: migrate Objects.

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `PR_26172_CHARLIE_repository-compliance-stack`. |
| Worktree clean before PR_013 edits | PASS | `git status --short` produced no output before this report was created. |
| Local/origin sync before PR_013 edits | PASS | `0 0`. |
| Main merge avoided | PASS | No merge to `main` was performed. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Review `toolbox/` | PASS | Active tool pages and legacy sidecar JS files were inventoried. |
| Review `assets/toolbox/` | PASS | Existing canonical Idea Board asset path was verified. |
| Review `assets/theme-v2/` | PASS | Theme V2 JS/CSS paths were verified as canonical. |
| Identify tool JS outside canonical locations | PASS | Candidate list includes legacy toolbox JS sidecars. |
| Identify tool CSS outside canonical locations | PASS | No active toolbox CSS sidecars found. |
| Identify inline script violations | PASS | No inline script blocks found in reviewed active tool pages. |
| Identify inline style violations | PASS | No inline style blocks/attributes found in reviewed active tool pages. |
| Rank next five safest migrations | PASS | See Recommended Next Five Tool Migrations. |
| Produce ZIP artifact | PASS | `tmp/PR_26172_CHARLIE_013-tool-js-css-canonical-migration-audit_delta.zip` generated. |

## Validation Lane Report

| Lane | Status | Notes |
| --- | --- | --- |
| Candidate inventory | PASS | Legacy sidecar files, script references, and inline script/style counts were reviewed. |
| Markdown/text review | PASS | This report contains candidate list and execution order. |
| Playwright | SKIP | Audit-only scope; no browser behavior changed. |
| Samples | SKIP | No sample files changed. |
| Full smoke | SKIP | Out of scope for audit-only PR. |

## Manual Validation Notes

- Text To Speech is the first migration because it is the only one-file tool JS sidecar in the current approved legacy list.
- Tags is the second migration because it has the fewest practical files and references after Text To Speech.
- The current guardrail only permits `assets/toolbox/{tool}/js/index.js`, so multi-file tools should be consolidated into the canonical entrypoint unless a future governance PR broadens the canonical tool asset shape.
- No runtime files were changed in this audit PR.
