# Codex Commands — PR 11.88

Model: GPT-5.4
Reasoning: high

```powershell
codex --model gpt-5.4 --reasoning high "Apply PR 11.88 from docs/pr/PR_11_88_ENGINE_OWNED_GAME_CHROME_AND_LAYERING.md. Fix all listed engine-owned chrome/layering issues in one pass. Keep scope targeted. Do not add wrappers, aliases, fallback assets, or guessed chrome paths. Update Asteroids manifest assets, enforce manifest-only bezel/background loading, ensure manifest backgrounds draw in all states, remove opaque game-level fills that hide engine backgrounds, preserve gameplay rendering, and write validation notes to docs/dev/reports/pr_11_88_validation.md."
```

## Required report
Codex must create:

```text
docs/dev/reports/pr_11_88_validation.md
```

Report must include:

- files changed
- manifest chrome asset declarations verified
- guessed chrome path search results
- background visible states checked
- console 404 check result
- `src/engine/utils/` search result
- whether full sample suite was skipped and why
