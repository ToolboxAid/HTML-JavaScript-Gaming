# Requirement Checklist - PR_26180_OWNER_022-resolve-remaining-src-dependencies

| Requirement | Status | Notes |
|---|---:|---|
| Checkout PR021 base | PASS | Rebuilt from `PR_26180_OWNER_021-archive-legacy-games-samples-teardown`. |
| Hard stop if current branch is main | PASS | Work performed on PR022 branch. |
| Hard stop if `www/` or `api/` missing | PASS | Both present. |
| Hard stop if root tracked `assets/`, `games/`, `learn/`, `toolbox/` exist | PASS | Tracked counts are 0. |
| Confirm remaining root `src` files | PASS | 65 before cleanup. |
| Delete `inMemoryProjectDataStore.js` | PASS | Deleted. |
| Resolve `src/shared/number/numbers.js` | PASS | Root file absent; `www/src/shared/number/numbers.js` exists. |
| Delete/archive obsolete `-v2` toolId files | PASS | None deleted because active tests reference them. |
| Delete/archive manifest/sample files only after scan | PASS | Preserved due active validation references. |
| Do not touch `dev/workspace/generated/tool-images/**` | PASS | Protected path untouched. |
| Preserve runtime behavior | PASS | Only path correction and obsolete validation helper deletion. |
| Run required validation | PASS | See validation report. |
| Produce ZIP under `dev/workspace/zips/` | PASS | `_delta.zip` created. |
