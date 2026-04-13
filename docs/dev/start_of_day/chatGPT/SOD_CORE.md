# SOD CORE (Token-Optimized)

## Workflow
- PLAN → BUILD → APPLY
- One PR purpose only
- BUILD must be one-pass executable

## Roles
- ChatGPT: docs + bundles
- Codex: code
- User: validate + commit

## BUILD Rules
- exact file targets required
- exact validation required
- no repo-wide scan
- no vague wording
- stop on ambiguity

## APPLY Rules
- docs only
- no Codex command

## ZIP Rule
- always output repo-structured ZIP
- path: <project>/tmp/

## Fail Fast
If unclear or vague → STOP and fix before BUILD
