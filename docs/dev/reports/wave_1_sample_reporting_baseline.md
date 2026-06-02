# Wave 1 Sample Reporting Baseline

PR: PR_26152_157-wave-1-sample-reporting-baseline
Date: 2026-06-02

## Scope

- Defined Wave 1 reporting standards.
- Aligned with ProjectWorkspace reporting.
- Ensured rebuilt and unrebuilt samples are reported separately.
- Confirmed unrebuilt samples remain SKIP.

## Reporting Standards

Wave 1 sample execution reports must include:

- exact sample paths in scope
- rebuilt sample list
- unrebuilt sample list
- schema surfaces used
- ProjectWorkspace handoff status
- Tool State ownership status
- manifest alignment status
- sample launch validation status only when explicitly run
- lanes executed and skipped
- samples decision
- Playwright impacted decision
- blocker scope

## Rebuilt vs Unrebuilt Reporting

| Category | Report Status |
| --- | --- |
| Rebuilt Wave 1 sample in active PR | PASS/FAIL/WARN based on the requested validation. |
| Wave 1 sample not rebuilt in active PR | SKIP / pending rebuild. |
| Non-Wave-1 sample | SKIP / out of scope. |
| Sample launch validation not requested | SKIP / not run. |
| Tool runtime validation not requested | SKIP / not run. |

## ProjectWorkspace Reporting Alignment

- Use ProjectWorkspace terminology.
- Do not report runtime launch UAT as passed unless explicitly run.
- Do not classify missing workspace schema assumptions as active runtime failures.
- Do not classify unrebuilt samples as failures.
- Report manifest, Tool State, and ProjectWorkspace boundaries independently.

## Validation

Static reporting review:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report reporting baseline only.

## Lanes Skipped

- samples - no sample JSON changes and no sample launch validation.
- runtime - no runtime behavior changed.
- tool runtime validation - not run.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

Unrebuilt samples remain SKIP / pending rebuild.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blocker for static reporting baseline.
