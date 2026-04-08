# BUILD_PR_SHARED_EXTRACTION_17_ENFORCEMENT_GUARD

## Purpose
Add a narrow regression guard that protects the completed shared-extraction work and prevents future drift.

## Single PR Purpose
Create one lightweight repo-local enforcement script that checks for these regressions only:

1. reintroduction of local helper definitions for:
   - `asFiniteNumber`
   - `asPositiveInteger`
   - `isPlainObject`

2. reintroduction of fragile direct shared relative imports like:
   - `../shared/`
   - `../../shared/`
   - `../../../src/shared/`

3. accidental `@shared/` alias usage in repo source files

This BUILD intentionally treats alias usage as disallowed technical debt and prevents further expansion of it.

## Exact Files Allowed
Edit only these 4 files:

1. `tools/dev/checkSharedExtractionGuard.mjs` **(new file)**
2. `package.json` **only if a minimal script entry is needed**
3. `docs/dev/commit_comment.txt` **inside this BUILD bundle only**
4. `docs/dev/next_command.txt` **inside this BUILD bundle only**

Do not edit any source/runtime file other than the one new guard script.
Do not edit any other repo file.

## Exact New File
Create:

`tools/dev/checkSharedExtractionGuard.mjs`

## Exact Script Requirements
The script must:

### 1) Scan only these repo roots if they exist
- `src/`
- `games/`
- `samples/`
- `tools/`

### 2) Inspect only source-like files with these extensions
- `.js`
- `.mjs`

### 3) Ignore:
- `node_modules/`
- `.git/`
- `tmp/`
- generated ZIP outputs
- binary assets

### 4) Report failure if any file contains a local helper definition matching any of these patterns
- `function asFiniteNumber(`
- `function asPositiveInteger(`
- `function isPlainObject(`
- `const asFiniteNumber =`
- `const asPositiveInteger =`
- `const isPlainObject =`

### 5) Report failure if any file contains direct shared relative imports matching any of these substrings
- `../shared/`
- `../../shared/`
- `../../../src/shared/`
- `../../../../shared/`

### 6) Report failure if any file contains alias imports using:
- `@shared/`

### 7) Exit behavior
- exit code `0` when no violations are found
- exit code `1` when one or more violations are found

### 8) Output behavior
Print:
- a short success message when clean
- for failures:
  - file path
  - matched violation type
  - matched text snippet or rule name

## package.json Rule
Only if `package.json` already exists and already has a `scripts` section:

Add exactly one script entry if missing:
```json
"check:shared-extraction-guard": "node tools/dev/checkSharedExtractionGuard.mjs"
```

Rules:
- make the minimum edit only
- do not reformat the whole file
- do not add unrelated scripts
- if `package.json` does not exist, do not create it
- if `scripts` does not exist, do not invent broader package metadata in this PR

## Hard Constraints
- do not modify application logic
- do not edit engine files
- do not edit advanced files
- do not edit sample files
- do not edit network_sample_c source files
- do not create CI config
- do not add lint tooling
- do not add alias support
- keep one PR purpose only

## Validation Checklist
1. Confirm only the allowed files changed
2. Confirm `tools/dev/checkSharedExtractionGuard.mjs` exists
3. Confirm the guard fails on:
   - local helper reintroduction
   - direct shared relative import strings
   - `@shared/` alias strings
4. Confirm the guard exits `0` when clean
5. Confirm no runtime/source logic changed
6. Confirm no CI/lint/toolchain config was added beyond the optional minimal `package.json` script entry

## Non-Goals
- no alias rollout
- no alias cleanup in this PR
- no repo-wide source edits
- no CI integration
- no ESLint rule creation
- no refactor beyond the new guard script
