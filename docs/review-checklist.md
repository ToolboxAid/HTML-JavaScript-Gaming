# Review Checklist

## Scope and Safety
- Change set is docs-only for this PR
- No engine/tools/samples/games/tests/runtime code modified
- `docs/pr/` history remains intact

## Dev Surface
- `docs/dev/` contains active-only controls and active reports
- `docs/dev/commit_comment.txt` remains header-free
- Active reports are in `docs/dev/reports/`
- Duplicate workflow/rules notes are consolidated or archived

## Architecture Docs
- Durable operating model is in `docs/architecture/repo-operating-model.md`
- Engine boundary rules are updated in `docs/architecture/engine-api-boundary.md`

## Archive and Cleanup
- Older operational files moved to `docs/archive/dev-ops/`
- Older generated reports moved to `docs/archive/generated-reports/`
- Obvious no-value artifacts removed when safe

## Packaging
- Delta ZIP output path uses `<project folder>/tmp/...`
