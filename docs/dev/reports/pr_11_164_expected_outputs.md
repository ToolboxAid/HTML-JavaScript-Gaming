# PR 11.164 Expected Outputs

Codex must create:

- `docs/dev/reports/pr_11_164_dead_code_ledger.md`
- `docs/dev/reports/pr_11_164_badge_ownership_map.md`
- `tmp/PR_11_164_DEAD_CODE_LEDGER_AND_REVERT_MAP.zip`

The ledger must not be vague. Every changed path since PR 11.159 must have one status:

- KEEP
- REVERT
- UNKNOWN
- INVESTIGATE

This PR is intentionally a freeze-and-trace PR. It must not continue adding badge fixes until ownership is proven.
