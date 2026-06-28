# PR_26179_OWNER_011-pr-branching-model-docs Requirement Checklist

| Requirement | Result | Notes |
| --- | --- | --- |
| Define Independent PRs vs Stacked PRs | PASS | Added canonical model in `pr_workflow.md`. |
| Independent PRs must start from `main` | PASS | Documented in Independent PR rules. |
| Stacked PRs may start from previous PR branch with direct dependency | PASS | Documented in Stacked PR rules and branch gates. |
| Stacked PRs must document dependency order | PASS | Required before BUILD begins and in reports. |
| Stacked PRs must be reviewed and merged in order | PASS | Required in Stacked PR rules. |
| Codex hard-stops on starting branch/model mismatch | PASS | Added to PR workflow, branch context, branch lock, and command docs. |
| Do not change implementation code | PASS | Documentation/governance only. |
