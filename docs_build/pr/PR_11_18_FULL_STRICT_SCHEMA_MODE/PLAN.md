# PLAN_PR_11_18_FULL_STRICT_SCHEMA_MODE

## Purpose
Force strict JSON Schema validation across the full tool/workspace schema set until every tool has a good, complete schema.

## Problem
Loose schemas are allowing malformed JSON payloads to pass. This is creating repeated tool/workspace failures, copied garbage JSON, unsupported fields, and payloads that do not match the intended data contracts.

## Decision
For this stabilization phase:
- `additionalProperties` must be `false` on all object schemas.
- Every allowed field must be explicitly declared.
- Unknown fields must fail validation.
- Missing schemas must be created instead of bypassed.
- Later, after all tools are working, selected internals may be relaxed intentionally.

## Scope
- All schemas under `toolbox/schemas/`
- Workspace schema
- Workspace manifest schema
- All tool schemas
- Sample 1902 only for validation/rebuild if needed
- No other sample changes unless required to fix schema validation for an already-invalid schema fixture
- Do not modify start_of_day folders

## Acceptance
- Every object schema in `toolbox/schemas/**/*.json` has `additionalProperties: false`
- No schema uses `additionalProperties: true`
- No object schema omits `additionalProperties`
- Workspace manifest references tool schemas via `$ref`
- Unknown fields fail validation
- Sample 1902 validates against strict schemas
- Workspace 1902 shows all valid tools, not only Palette
