# Tool Migration Lane Bootstrap

PR: PR_26152_123-tool-migration-lane-bootstrap
Date: 2026-06-02

## Scope

- Bootstrapped tool migration lane governance.
- Defined how future tool migration PRs validate migrated tools only.
- Kept samples as SKIP / pending rebuild.
- Kept unmigrated tools as SKIP / out of scope.
- Used ProjectWorkspace terminology.

## Future Tool Migration PR Rules

- Name the exact tool or tools in scope.
- Validate only those migrated tools.
- Keep all other unmigrated tools SKIP / not migrated / out of scope.
- Do not classify unmigrated tools as failures.
- Require explicit ProjectWorkspace launch inputs.
- Require manifest handoff to use declared fields only.
- Require Tool State to remain the saved editing source.
- Require ProjectWorkspace to remain coordination-only.
- Require palette and asset references to stay explicit.
- Reject hidden fallback data, sample JSON, `localStorage`, or `sessionStorage` assumptions.

## Future Validation Ladder

Use only the lanes named by the future migration PR:

1. `git diff --check`
2. ProjectWorkspace launch boundary validation for the migrated tool.
3. ProjectWorkspace manifest handoff boundary validation for the migrated tool.
4. ProjectWorkspace state/lifecycle boundary validation for the migrated tool.
5. Targeted tool runtime test only when the future PR explicitly requires runtime validation for that migrated tool.

Do not use tool runtime tests as blockers for tools that are not in scope.

## Samples Rule

Samples remain SKIP / pending rebuild until a dedicated sample rebuild PR explicitly scopes them.

Future tool migration PRs must not use sample JSON as hidden fallback data.

## Report Rule

Future tool migration reports should state:

- exact migrated tools
- exact skipped tools
- lanes executed
- lanes skipped
- samples decision
- whether runtime validation was in scope
- whether ProjectWorkspace launch/manifest/state/lifecycle boundaries passed

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report lane bootstrap only.

## Lanes Skipped

- runtime - no tool runtime code changed.
- tool runtime tests - not required and not run.
- samples - SKIP / pending rebuild.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. No samples were touched.

## Tools Decision

Future migration PRs validate migrated tools only. Unmigrated tools remain SKIP / out of scope.
