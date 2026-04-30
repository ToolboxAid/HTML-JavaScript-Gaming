# PROJECT INSTRUCTIONS (UPDATE)

## 🔧 ARRAY FORMATTING RULE (MANDATORY)

All arrays MUST be formatted in single-line compact form when values are simple primitives.

### ❌ Invalid
[
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1
],

### ✅ Valid
[
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
],

## Rules

- Apply to:
  - numbers
  - strings
  - booleans

- Do NOT apply to:
  - objects
  - nested arrays
  - complex structures

- Max line length rule:
  - If array exceeds reasonable readability (~120 chars), allow wrap but prefer compact grouping

## Enforcement

- Schema validation MUST NOT allow multi-line primitive arrays
- Codex must normalize arrays during BUILD
- All samples/tools/games must comply

