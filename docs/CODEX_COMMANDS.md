# Codex Commands

Use these from the repository root when you want Codex CLI to inspect or update the repo locally.

## Review commands

```bash
codex "Review engine/core for architecture issues. Classify public, internal, and private boundaries. Summarize findings and proposed PRs."
```

```bash
codex "Read docs/reviews/architecture-review-v1.md and docs/reviews/pr-roadmap.md, then align them with the current engine/core architecture."
```

## Controlled edit commands

```bash
codex --auto-edit "Update docs/reviews/architecture-review-v1.md with the current engine/core findings. Update docs/reviews/pr-roadmap.md with new PRs for engine/core. Do not change source code."
```

```bash
codex --auto-edit "Refactor engine/core so GameBase construction does not start the runtime automatically. Add an explicit start method and update direct callers if needed. Keep behavior equivalent otherwise."
```

## Full-auto only when you are ready

```bash
codex --full-auto "Split runtime-only files from visual helpers in engine/core, moving files to the most appropriate engine folders. Update imports and docs. Run tests if available."
```

## Useful maintenance commands

```bash
codex --upgrade
```

```bash
codex --login
```

## Notes

- `--auto-edit` lets Codex write files locally while you stay in control of the repo.
- `--full-auto` is best reserved for bounded refactors with tests or easy manual verification.
- Review proposed diffs before commit.
