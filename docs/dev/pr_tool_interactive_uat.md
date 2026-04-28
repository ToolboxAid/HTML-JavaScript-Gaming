# PR — Tool Interactive UAT

## Purpose
Perform browser-based interactive validation of core tools after stabilization.

This PR is validation-only. Do not add features or change behavior.

---

## Scope

Tools:
- Vector Map Editor
- Vector Asset Studio
- Sprite Editor
- State Inspector

---

## Test Matrix

### 1. Vector Map Editor

- Launch tool
- Confirm:
  - No auto-selection
  - No hidden data loaded
  - Empty state visible

- Load/select objects (if available)
- Verify:
  - Selection changes visually
  - Selection clears correctly

---

### 2. Vector Asset Studio

- Select editable object
- Modify:
  - Fill / paint
  - Stroke

- Verify:
  - Visual updates occur
  - Controls disable when no selection
  - Disabled controls show reason

- Remove required config (test)
- Verify:
  - Actionable error displayed
  - No silent fallback

---

### 3. State Inspector

- Input valid JSON
  - Confirm pretty formatting

- Input invalid JSON
  - Confirm clear parse error

- Input non-object JSON
  - Confirm validation message

- Empty input
  - Confirm empty-state message

---

### 4. Sprite Editor

- Launch tool
- Verify:
  - Header format correct
  - No fallback data
  - No unexpected errors

---

## Reporting

For each tool:
- PASS / FAIL
- Notes on behavior
- Screenshots (optional)
- List of issues discovered

---

## Acceptance Criteria

- All tools pass interactive validation
- No silent fallback behavior observed
- Errors are actionable and visible
- Header UX consistent across tools

---

## Out of Scope

- New features
- Refactoring
- Game engine changes
