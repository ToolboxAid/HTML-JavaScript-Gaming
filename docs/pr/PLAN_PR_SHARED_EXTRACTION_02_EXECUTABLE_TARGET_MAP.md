# PLAN_PR_SHARED_EXTRACTION_02_EXECUTABLE_TARGET_MAP

## Purpose
Replace the non-executable target map with an execution-grade target map for shared-helper extraction.

This PLAN exists because `BUILD_PR_SHARED_EXTRACTION_02_EXACT_HELPER_MOVE` failed the BUILD fail-fast rule:
the referenced target map does not provide enough explicit information to execute without guessing.

## Current Blocker
The current target map is not executable because it does **not** provide all of the following:

1. Exact source file list
2. Exact destination file list
3. Exact source -> destination mapping
4. Exact import-update targets

Because those details are missing, any attempted execution would require guessing, which is not allowed.

## Scope
This PR purpose is **only** to define the execution-grade target map requirements and replacement structure.
It does **not** execute moves.
It does **not** change runtime code.
It does **not** change engine APIs.

## Required Replacement Artifact
Create or replace the target map with a document that contains these four sections exactly:

### 1) Exact Source Files
List each source file that currently contains a duplicate helper.

Required format:

- `source_file: <repo-relative path>`
- `helpers_in_file: [<helper_1>, <helper_2>, ...]`

### 2) Exact Destination Files
List each destination file under `src/shared` that will own moved helpers.

Required format:

- `destination_file: <repo-relative path>`
- `helpers_owned: [<helper_1>, <helper_2>, ...]`

### 3) Exact Source -> Destination Mapping
List every helper move individually.

Required format:

- `helper: <helper_name>`
- `from: <repo-relative source file>`
- `to: <repo-relative destination file>`

### 4) Exact Import Update Targets
List every file whose imports must change because of the move.

Required format:

- `consumer_file: <repo-relative path>`
- `remove_import_from: <old path or inline/local helper reference>`
- `add_import_from: <new shared path>`
- `helpers: [<helper_1>, <helper_2>, ...]`

## Mandatory Constraints
- DO NOT scan the repo
- ONLY use explicitly listed files
- NO engine API changes
- NO new files unless explicitly listed
- One PR purpose only
- No guessing
- No fallback wording such as "as needed", "if found", or "scan for duplicates"

## Execution Readiness Gate
The replacement target map is executable only if all answers below are **yes**:

- Are all source files explicitly listed?
- Are all destination files explicitly listed?
- Does every helper have one exact `from` and one exact `to`?
- Are all import update targets explicitly listed?
- Can Codex execute the moves without opening unrelated files or discovering anything?

If any answer is **no**, stop and do not issue a BUILD.

## Non-Goals
- No helper movement
- No import edits
- No refactors
- No renames
- No logic changes
- No validation claims about code

## Next Allowed Step
Only after this executable target map exists should the workflow proceed to:

`BUILD_PR_SHARED_EXTRACTION_02_EXACT_HELPER_MOVE`
