# PLAN_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE

## Purpose
Prepare the next repo cleanup lane and re-baseline the master roadmap after the recent tool-host, asset-pipeline, debug-inspector, and launch-smoke work.

## User Constraint Applied
- track `templates/` in the roadmap update
- do nothing with `templates/` yet
- cleanup work remains planned and staged, not mixed into active implementation lanes

## Bundle Intent
This is a docs-first cleanup + roadmap package that:
1. updates roadmap statuses conservatively
2. records cleanup targets and sequencing
3. defers actual repo cleanup to a dedicated later build lane

## Why This PR Now
Recent lanes materially changed tool and validation maturity:
- tools/shared normalization work advanced
- tool host foundation / switching / handoff / project integration advanced
- asset pipeline foundation / converters / validation-output advanced
- debug inspector tools entered active lane
- launch-smoke coverage and tooling validation improved

The roadmap should reflect those lane advancements before broader cleanup work begins.

## Cleanup Scope For Later Execution
The later cleanup lane should evaluate:
- `templates/`
- legacy tool scaffolds
- old/duplicate helper clusters already superseded
- legacy path references
- archived notes / old keep policies

## Explicit Non-Goals For This Bundle
- no deletion
- no folder movement
- no `templates/` changes now
- no broad repo churn
- no mixed implementation work

## Recommended Later Cleanup Sequence
1. inventory legacy and transitional folders
2. verify live references
3. classify keep vs move vs future-delete
4. run smoke validation before and after cleanup
5. isolate cleanup in dedicated exact-scope PRs
