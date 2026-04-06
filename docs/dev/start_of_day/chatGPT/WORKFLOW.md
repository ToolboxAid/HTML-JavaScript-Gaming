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

### When Codex reports code is complete
Produce an APPLY/acceptance bundle only.
Do not send Codex another command unless more code is actually required.

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
