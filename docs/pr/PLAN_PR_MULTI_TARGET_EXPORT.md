# PLAN_PR_MULTI_TARGET_EXPORT

## Goal
Add multi-target export planning so validated projects can produce deterministic outputs for web, desktop, and related deployment targets without breaking strict packaging rules.

## Context
Build on the accepted Level 15 baseline:
- full authoring platform
- enforced validation
- assistive remediation
- strict packaging
- strict runtime loading
- Level 14 expansion capabilities
- platform validation suite
- self-validating platform workflow

## Scope
- target manifest contracts
- target-specific packaging/export profiles
- shared vs target-specific asset inclusion rules
- deployment artifact layout expectations
- reporting for target-specific export results

## Non-Goals
- No engine core API changes
- No bypass of accepted validation/packaging/runtime boundaries
- No destructive migration requirements
- No weakening of deterministic behavior expectations

## Core Contracts
1. Level 15 accepted platform baseline remains authoritative.
2. New capability must compose with validation suite coverage.
3. Deterministic behavior and readable reporting remain required where practical.
4. New workflows must not bypass enforced validation or strict packaging/runtime guarantees.
5. Future APPLY boundaries must stay docs-only.

## Manual Validation Checklist
1. Accepted Level 15 flows still work.
2. New capability composes with registry, graph, validation, remediation, packaging, and runtime.
3. Reports remain readable and stable.
4. No engine core API changes are required.

## Next Command
BUILD_PR_{key}
