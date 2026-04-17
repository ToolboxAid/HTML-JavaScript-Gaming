# BUILD_PR_PREVIEW_PATH_CONTRACT_REALIGNMENT

## Purpose
Realign the preview tool path contract after the samples path structure changed.

## Problem Statement
The preview tool previously worked from:
- `tools/shared/preview`

It now lives at:
- `tools/preview`

The sample path structure also changed and now resolves sample entry pages as:
- `<phase>-<xx>/<xxxx>/index.html`

The preview tool is not working because it still assumes the previous sample path contract.

There may also be stale references to:
- `samples/shared`

That path must be validated. If it is still used for preview-related behavior, update it to use the current `tools/preview` path contract or remove the obsolete dependency if no longer needed.

## Scope
- one PR purpose only
- fix preview path resolution only
- docs-first bundle
- no implementation code authored by ChatGPT
- no repo-wide cleanup beyond exact preview-path callers and related path-contract references

## Required Codex Work
1. Inspect `tools/preview` and identify all path-resolution assumptions tied to the old sample structure.
2. Update preview resolution to support the current sample entry contract:
   - `<phase>-<xx>/<xxxx>/index.html`
3. Inspect for any references to `samples/shared` that affect preview behavior.
4. If `samples/shared` is still used by preview-related flows:
   - migrate those references to the current `tools/preview` contract where appropriate
   - or remove the obsolete dependency if it is no longer valid
5. Preserve existing preview behavior outside the path-contract fix.
6. Do not expand into unrelated sample, engine, or tool cleanup.

## Validation Requirements
- preview resolves current sample paths successfully
- no remaining broken assumptions tied to the old path format
- any `samples/shared` preview dependency is either updated or removed with validation
- change remains tightly scoped to preview path-contract repair

## Acceptance
- `tools/preview` works with the current sample path format
- path resolution targets `<phase>-<xx>/<xxxx>/index.html`
- no stale preview dependency on `samples/shared` remains unaddressed
- reports are written under `docs/dev/reports`
- Codex packages final output ZIP at:
  `<project folder>/tmp/BUILD_PR_PREVIEW_PATH_CONTRACT_REALIGNMENT.zip`
