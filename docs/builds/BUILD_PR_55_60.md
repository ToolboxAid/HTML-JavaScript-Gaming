Toolbox Aid
David Quesenberry
03/21/2026
BUILD_PR_55_60.md

# BUILD_PR 55-60

## Scope
Add first-pass gameplay system samples for:

- 55 slopes / ramps
- 56 gravity zones
- 57 ladders / climb zones
- 58 moving platforms
- 59 one-way platforms
- 60 friction surfaces

## Build Shape
This delta is intentionally surgical:

- 1 shared helper file under `samples/_shared/`
- 6 new sample folders
- build docs and command files

## Notes
These samples are designed to run against the uploaded GitHub repo baseline that currently ends at Sample 48.
They prove the next gameplay concepts without attempting a large engine rewrite in the same PR.
