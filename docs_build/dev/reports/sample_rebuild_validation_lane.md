# Sample Rebuild Validation Lane

PR: PR_26152_147-sample-rebuild-validation-lane
Date: 2026-06-02

## Scope

- Defined sample rebuild validation lane.
- Defined when sample launch validation becomes active.
- Defined PASS/FAIL/SKIP rules for rebuilt vs unrebuild samples.
- Did not require all samples to pass.

## Validation Activation Rules

| Case | Status Rule | Notes |
| --- | --- | --- |
| Rebuilt sample JSON modified in the active PR | PASS/FAIL | Validate only the rebuilt sample files and their declared handoff. |
| Rebuilt sample launch added in the active PR | PASS/FAIL | Run targeted launch validation only for rebuilt samples. |
| Unrebuild sample outside active PR scope | SKIP | Do not classify unrebuild samples as failures. |
| Legacy sample JSON still pending rebuild | SKIP | Document as pending rebuild. |
| Sample metadata/index support files | SKIP unless explicitly scoped | Do not expand validation into unrelated sample support files. |
| Full sample tree validation | SKIP | Not required until a future explicit full-lane PR. |

## Required Future Validation Sequence

1. Static JSON parse for rebuilt sample files.
2. Schema validation against the selected manifest/tool payload schema.
3. ProjectWorkspace launch boundary validation.
4. Manifest handoff boundary validation.
5. Tool State ownership boundary validation.
6. Targeted sample launch smoke only when explicitly scoped.

## PASS/FAIL/SKIP Vocabulary

| Status | Meaning |
| --- | --- |
| PASS | Rebuilt sample satisfies the exact validation lane requested by its execution PR. |
| FAIL | Rebuilt sample in scope violates the selected schema, handoff, ownership, or launch rule. |
| WARN | Rebuilt sample has non-blocking follow-up that does not violate the active lane. |
| SKIP | Sample is not rebuilt, not scoped, pending rebuild, or belongs to a future lane. |

## Guardrails

- Do not run sample launch validation for unrebuild samples.
- Do not require all samples to pass.
- Do not modify sample JSON in planning PRs.
- Do not rely on `localStorage`, `sessionStorage`, hidden bootstrap data, or fallback data.
- Do not persist `imageDataUrl`; use file/path fields as source of truth.
- Use ProjectWorkspace terminology for active handoff and lifecycle boundaries.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report validation-lane planning only.

## Lanes Skipped

- samples - SKIP / pending rebuild; sample launch validation was not run.
- runtime - no runtime behavior changed.
- integration - no feature integration changed.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. Rebuilt samples only become PASS/FAIL validation targets in future execution PRs.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blockers for docs-only sample rebuild validation lane planning.
