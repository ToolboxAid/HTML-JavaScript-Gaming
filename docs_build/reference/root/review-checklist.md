# Review Checklist

## Scope and Safety
- Change set is docs-only for this PR
- No src/engine/tools/samples/old_games/tests/runtime code modified
- `docs_build/pr/` history remains intact

## Dev Surface
- `docs_build/dev/` contains active-only controls and active reports
- `docs_build/operations/dev/commit_comment.txt` remains header-free
- Active reports are in `docs_build/dev/reports/`
- Duplicate workflow/rules notes are consolidated or archived

## Architecture Docs
- Durable operating model is in `docs_build/reference/architecture-standards/architecture/repo-operating-model.md`
- Engine boundary rules are updated in `docs_build/reference/architecture-standards/architecture/engine-api-boundary.md`

## Archive and Cleanup
- Older operational files moved to `docs_build/archive/dev-ops/`
- Older generated reports moved to `docs_build/archive/generated-reports/`
- Obvious no-value artifacts removed when safe

## Packaging
- Delta ZIP output path uses `<project folder>/tmp/...`
