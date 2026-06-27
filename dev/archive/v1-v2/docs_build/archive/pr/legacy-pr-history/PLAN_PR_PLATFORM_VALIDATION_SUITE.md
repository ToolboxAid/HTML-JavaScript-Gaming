# PLAN_PR_PLATFORM_VALIDATION_SUITE

## Goal
Define a platform-level validation suite that verifies the full authoring, validation, remediation,
packaging, runtime, streaming, plugin, and versioning flows across the accepted platform baseline.

## Context
The project baseline now includes:
- registry-aware editors
- dependency graph
- enforced validation
- assistive remediation
- strict packaging
- strict runtime loader
- editor experience layer
- runtime streaming
- plugin architecture
- project versioning

The next architectural layer is a repeatable validation suite that protects the platform against regressions
and gives future PRs a stable target for acceptance.

## Scope
- Define end-to-end platform scenarios
- Define golden-path and failure-path validation cases
- Define deterministic packaging/runtime verification cases
- Define plugin/versioning/streaming validation coverage
- Define reporting expectations for suite output
- Define acceptance thresholds for future changes

## Non-Goals
- No engine core API changes
- No replacement of existing validation engine contracts
- No destructive migration requirements
- No ad hoc one-off manual-only validation strategy

## Core Suite Categories
- baseline valid project flow
- invalid reference enforcement flow
- remediation confirmation flow
- deterministic packaging comparison flow
- runtime ready/fail-fast flow
- streaming flow validation
- plugin integration flow
- project version compatibility flow

## Proposed Suite Model
```json
{
  "platformValidationSuite": {
    "version": 1,
    "scenarios": [],
    "reports": [],
    "status": "pass | fail"
  }
}
```

## Core Contracts
1. The suite validates full flows, not isolated helpers only.
2. Golden-path valid projects must pass end-to-end.
3. Known-invalid projects must fail at the correct enforced boundaries.
4. Remediation scenarios must demonstrate recoverability.
5. Packaging and runtime determinism must be testable repeatedly.
6. Plugin, versioning, and streaming support must be covered explicitly.
7. Reports must be stable and readable for future automation.
8. Engine core APIs remain unchanged.

## Manual Validation Checklist
1. Valid baseline project passes full flow.
2. Invalid project fails at expected boundary.
3. Remediation can return project to valid state.
4. Packaging results remain deterministic.
5. Runtime ready/fail-fast behavior is validated.
6. Streaming behavior preserves correctness.
7. Plugin integration is validated safely.
8. Versioned project compatibility is validated.
9. Reports are readable and stable.

## Next Command
BUILD_PR_PLATFORM_VALIDATION_SUITE
