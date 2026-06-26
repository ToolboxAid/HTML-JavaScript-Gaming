# Canonical Repository Structure

## Purpose

Establish the canonical repository structure for future development and reduce technical debt.

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

Serverside:
- serverside/{feature-name}/

## Rules

- Theme first.
- Tool CSS second.
- Shared functionality belongs in assets/js/shared/.
- No new scattered JS folders.
- No new scattered CSS folders.
- New development follows the canonical structure.
