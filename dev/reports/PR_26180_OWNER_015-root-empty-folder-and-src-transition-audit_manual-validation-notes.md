# PR_26180_OWNER_015 Manual Validation Notes

- No named local-only root folder was deleted in this PR.
- `assets/DemoGame-26168-001.gfsp` is ignored local data and remains untouched.
- Empty local directory shells under `games/`, `learn/`, `tmp/`, and `toolbox/` are not tracked and do not affect the PR diff.
- `src/` is intentionally retained pending explicit source-layer migration PRs.
- Codex output ZIP is generated under `dev/workspace/zips/`, not root `tmp/`.
- Public favicon ownership remains `www/favicon.svg`.
