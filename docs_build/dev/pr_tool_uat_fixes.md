# PR — Tool UAT Fixes

## Purpose

Fix the failures found during the four-tool interactive UAT.

This PR is scoped only to the UAT failures. Do not add new features.

---

## UAT Summary

Interactive UAT results:

- Vector Map Editor: FAIL
- Vector Asset Studio: FAIL
- Sprite Editor: FAIL
- State Inspector: PASS

State Inspector passed all VS-001 through VS-005 checks and is out of scope for this PR.

---

## Scope

Fix only:

1. Vector Map Editor default selected-state visibility after loading sample `1212`
2. Vector Asset Studio sample load timeouts for `0901`, `1204`, `1208`
3. Vector Asset Studio missing invalid/incomplete-state actionable message
4. Sprite Editor missing invalid-state actionable message

Do not modify unrelated tools, sample games, runtime engine files, or `start_of_day` folders.

---

## 1. Vector Map Editor — Selected-State Visibility

### Failure

PR 10.6V acceptance failed after loading sample `1212`.

Observed:

- `objectCount=3`
- `activeCount=0`
- selected shown as none

### Required Behavior

After loading a map/sample with objects, the editor must clearly show the selected-state status.

Allowed outcomes:

- If no object is selected, show an explicit visible message such as:
  `No object selected. Select an object from the map or object list.`
- If an object is selected by the user, show the selected object clearly.
- Do not silently auto-select the first object.
- Do not restore stale hidden selections.

### Acceptance Criteria

- Loading sample `1212` with three objects shows an explicit no-selection message.
- User selection updates the selected-state display.
- Clearing selection returns to the explicit no-selection message.
- No silent auto-selection occurs.

---

## 2. Vector Asset Studio — Sample Load Timeouts

### Failure

Samples `0901`, `1204`, and `1208` timed out.

Because they timed out, paint/stroke enablement-after-selection could not be validated.

### Required Behavior

- Samples `0901`, `1204`, and `1208` must load or fail with an actionable error before UAT timeout.
- Loading must not depend on hidden fallback data.
- If required manifest/config/assets are missing, show an actionable error.
- Do not silently create palette/paint/stroke defaults.

### Acceptance Criteria

For each sample:

- `0901`
- `1204`
- `1208`

Confirm one of:

1. Sample loads successfully and paint/stroke selection checks can run, OR
2. Sample fails fast with actionable error explaining missing/invalid input.

Timeout is not acceptable.

---

## 3. Vector Asset Studio — Invalid/Incomplete State Message

### Failure

VS-005 failed because invalid/incomplete-state actionable message was not observed.

### Required Behavior

When Vector Asset Studio receives invalid or incomplete state:

- Display visible actionable error
- Identify missing or invalid field/config
- Explain what the user should provide or fix
- Do not silently normalize into fake valid state
- Do not auto-build hidden palette defaults

### Acceptance Criteria

- Invalid state produces visible actionable message.
- Incomplete state produces visible actionable message.
- Error is discoverable by UAT automation and human users.
- No silent fallback data is introduced.

---

## 4. Sprite Editor — Invalid-State Message

### Failure

VS-005 failed because invalid-state actionable message was not observed.

### Required Behavior

When Sprite Editor receives invalid state:

- Display visible actionable error
- Identify the missing or invalid input
- Explain what to fix
- Do not silently load fallback sample sprite/assets

### Acceptance Criteria

- Invalid state produces visible actionable message.
- Empty/missing state produces safe empty state or actionable message.
- No hidden fallback sprite/sample data loads.

---

## Error Message Standard

All actionable messages should include:

- Tool name
- What failed
- What is missing or invalid
- What the user should do next

Example:

```txt
Vector Asset Studio cannot load sample 0901 because required palette configuration is missing. Provide a palette manifest or choose a valid asset package.
```

---

## Validation

Run:

```powershell
node --check "toolbox/Vector Map Editor/editor/VectorMapEditorApp.js"
node --check "toolbox/Vector Asset Studio/main.js"
node --check "toolbox/Sprite Editor/main.js"
npm run test:launch-smoke -- --tools
```

Then rerun the interactive UAT checks that failed:

- Vector Map Editor sample `1212`
- Vector Asset Studio samples `0901`, `1204`, `1208`
- Vector Asset Studio VS-005
- Sprite Editor VS-005

---

## Acceptance Criteria

- Vector Map Editor passes selected-state visibility for sample `1212`
- Vector Asset Studio no longer times out for samples `0901`, `1204`, `1208`
- Vector Asset Studio VS-005 passes
- Sprite Editor VS-005 passes
- State Inspector remains passing
- No silent fallback data is introduced
- No unrelated files are changed

---

## Out of Scope

- New features
- Tileset breakout
- King of the Iceberg implementation
- Runtime engine changes
- State Inspector changes unless required by shared code
- `start_of_day` changes
