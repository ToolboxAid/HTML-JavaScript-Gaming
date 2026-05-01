# PR_11_193 Validation Plan

## Targeted Checks
- node --check for each active V2 `index.js`
- manual launch for each active V2 tool folder that exists
- confirm shared header renders from `#shared-theme-header`
- confirm no JS-driven page shell injection remains

## Full Samples Smoke
Skipped by design. Reason: isolated V2 tool shell/behavior separation only; no shared sample loader/framework change.

## Evidence Required From Codex
- list of V2 folders found
- list of files changed
- syntax check results
- grep evidence showing disallowed patterns removed from V2 `index.js`
- manual verification notes for header mount and empty/error states
