# Canonical Repository Structure

## Purpose

Prevent technical debt by requiring all new and modified code to follow one repository structure.

## Canonical Structure

Tools:
- toolbox/{tool-name}/index.html

Tool assets:
- assets/toolbox/{tool-name}/js/index.js
- assets/toolbox/{tool-name}/css/index.css

Themes:
- assets/theme-v1/
- assets/theme-v2/

Shared JavaScript:
- assets/js/shared/

Engine:
- src/engine/{feature-name}/

API:
- api/{feature-name}/

Server:
- server/{feature-name}/

Tests:
- tests/toolbox/{tool-name}/
- tests/engine/{feature-name}/
- tests/api/{feature-name}/
- tests/server/{feature-name}/
- tests/js/shared/
- tests/regression/

## Rules

- Theme first. Use theme styles whenever possible.
- Tool CSS is allowed only when a requirement cannot be satisfied by the active theme.
- Every tool must be independently testable.
- Regression tests do not replace tool-level tests.
- Shared functionality belongs in assets/js/shared/.
- New development must follow the canonical structure.
- No new scattered JavaScript folders.
- No new scattered CSS folders.
- No new scattered test folders.

## Legacy Migration

When a tool is modified:

1. Review JS location.
2. Review CSS location.
3. Review test location.
4. Move touched files into the canonical structure.
5. Update imports.
6. Update tests.
7. Remove legacy references.

Legacy files may only be deleted when no active references remain.

## Folder Ownership

A folder may contain only assets related to that feature.

Example:

assets/toolbox/text-to-speech/

may not contain files used exclusively by another tool.

Shared functionality must be moved to:

assets/js/shared/
