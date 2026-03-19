PR-018 — forbidden change matrix

### Forbidden First-Code-PR Changes

| Guardrail Category | Forbidden Status | Rationale | Review Note |
| --- | --- | --- | --- |
| export removal | forbidden | compatibility-retained exports must remain intact in the first code PR | any removal immediately fails review |
| export renaming | forbidden | rename risk is too high for the first code step | any rename must be staged later, if ever approved |
| file moves | forbidden | file moves add unnecessary surface area and break risk | first code PR must not restructure directories |
| import path rewrites | forbidden | import churn raises break risk and obscures review | keep all import paths unchanged |
| runtime behavior changes | forbidden | first code PR must be non-behavioral | reject logic changes even if small |
| hiding compatibility-retained surfaces | forbidden | completed docs work explicitly preserves compatibility | visibility narrowing must come much later, if approved |
| mixed-purpose refactor scope | forbidden | first code PR must remain single-purpose and surgical | reject bundled cleanup unrelated to documented intent |

### Forbidden Change Rule

If a code change could plausibly break callers, it does not belong in the first code PR.
