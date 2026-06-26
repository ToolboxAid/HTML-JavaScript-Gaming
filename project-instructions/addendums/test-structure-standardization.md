# Test Structure Standardization

## Purpose

Standardize testing locations and ensure independent tool validation.

## Canonical Test Structure

Tool tests:
- tests/toolbox/{tool-name}/

Engine tests:
- tests/engine/{feature-name}/

API tests:
- tests/api/{feature-name}/

Server tests:
- tests/server/{feature-name}/

Shared JavaScript tests:
- tests/js/shared/

Regression tests:
- tests/regression/

## Rules

- Every tool must be independently testable.
- Regression tests do not replace tool tests.
- Tool tests validate tool functionality.
- Regression tests validate platform behavior.
- New tests follow the canonical structure.
