PR-018 — engine/game refactor readiness guardrails build

### Purpose

This BUILD_PR records docs-only guardrails for the first non-docs `engine/game` refactor PR.

### Verified Baseline

This build uses the completed docs-first groundwork from PR-002 through PR-017, including:
- boundary direction
- verified export inventory
- verified caller evidence
- compatibility retention labels
- usage-based risk tiers
- transition-planning candidate split
- documentation posture and wording rules
- reusable snippets and per-export documentation drafts

### What This BUILD_PR Does

- defines what the first code PR may change
- defines what the first code PR must not change
- records compatibility invariants that must remain true
- defines review guardrails for the first code PR
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
