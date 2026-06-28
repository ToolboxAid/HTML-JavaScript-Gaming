# PR_26179_OWNER_012-gitignore-env-simplification Requirement Checklist

Updated: 2026-06-28T03:47:16Z

- [x] Current branch started from main.
- [x] Worktree was clean before changes.
- [x] Updated `.gitignore` only for the requested source change.
- [x] Replaced `.env` and `.env.*` with `.env*`.
- [x] Added `# Environment files` comment.
- [x] Preserved `!.env.example`.
- [x] Preserved `!.env.sample`.
- [x] Preserved `!.env.template`.
- [x] `.env` ignored.
- [x] `.env.dev` ignored.
- [x] `.env.ist` ignored.
- [x] `.env.uat` ignored.
- [x] `.env.prd` ignored.
- [x] `.env.local` ignored.
- [x] `.env.example` tracked and not ignored.
- [x] `.env.sample` exception active; file is absent/not tracked in repo.
- [x] `.env.template` exception active; file is absent/not tracked in repo.
- [x] `git diff --check` passed.
