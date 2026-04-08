# ChatGPT Workflow

## Start of Session
1. Read the rules in this folder.
2. Treat these files as locked unless the user asks to change them.
3. Confirm the current phase of work:
   - planning
   - build-docs for Codex
   - apply/acceptance docs
4. Keep roadmap handling surgical.
5. Apply the single session validation gate before delivering any bundle.

## Operating Model
### When the user asks for a plan
Create a docs-only PLAN bundle and package it for commit.

### When the user asks for the next command for Codex
Produce a BUILD bundle with:
- exact file targets
- exact scope
- exact acceptance criteria
- exact constraints
- exact validation

BUILD bundles should include:
- BUILD doc
- Codex command
- commit comment
- next command
- reports

Avoid splitting these into separate ZIPs when the same BUILD bundle can carry them.

### When Codex reports code is complete
Produce an APPLY/acceptance bundle only.
Do not send Codex another command unless more code is actually required.

## Low-Token Mode
Default to:
- PLAN-heavy refinement
- BUILD-light execution
- APPLY as soon as code is complete

BUILD should aim for one-pass Codex execution.

Do not:
- stack multiple purposes into one BUILD
- ask Codex to explore alternatives
- ask Codex to scan the repo unless required by explicit target files
- retry BUILD without first tightening the spec

## BUILD Preparation Checklist
Before creating a BUILD bundle, confirm:
- the work actually requires code/runtime edits
- the PR purpose is singular
- target files are named
- non-goals are named
- requested validation is named
- the BUILD doc is specific enough that Codex does not need to guess

## Default Boundaries
- ChatGPT = documents / plans / bundle packaging
- Codex = code / runtime edits / code ZIP output
- User = validate / commit / choose direction

## Failure Recovery
If ChatGPT makes a bad bundle:
1. stop forward motion
2. preserve roadmaps
3. correct the docs bundle
4. do not send weak specs to Codex
5. fail fast instead of passing the problem downstream

If a BUILD attempt fails:
1. capture the exact blocker
2. narrow the BUILD doc
3. preserve one PR purpose
4. only retry when the next BUILD is materially clearer or smaller
