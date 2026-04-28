# PR — Tool Stabilization

## Purpose

Stabilize the tool workspace so layout, asset, and inspection tools are reliable before building King of the Iceberg screens or gameplay maps.

This PR is stabilization only. Do not add new features.

---

## Priority Order

1. Vector Map Editor default selection issue
2. Paint / stroke not working
3. State Inspector JSON usability
4. Remove silent fallback data
5. Header polish follow-up from prior PR

---

## Scope

Target tools and shared code only:

- Vector Map Editor
- Vector Asset Studio
- Sprite Editor
- State Inspector
- Shared platform shell / registry code used by those tools

Do not modify sample games, runtime game engine files, or start_of_day folders.

---

## 1. Vector Map Editor Default Selection

### Problem

The Vector Map Editor should open in a predictable state and should not silently select the wrong tool, object, or default sample.

### Required Behavior

- On load, the active selection state must be explicit.
- If no map, object, or manifest is loaded, show an empty-state message.
- Do not silently load hidden/default sample assets.
- Do not silently select an object that the user did not choose.
- If a default editor mode is needed, use a visible neutral mode such as Select/Pan.
- The UI must clearly show the active tool/mode.

### Validation

- Open Vector Map Editor fresh.
- Confirm active mode is visible.
- Confirm no hidden/default asset loads.
- Confirm user can intentionally select map objects.
- Confirm selection state clears correctly when no object is selected.

---

## 2. Paint / Stroke Not Working

### Problem

Paint and stroke controls must work consistently in the relevant asset/vector tools.

### Required Behavior

- Paint/fill controls must update the selected asset/object.
- Stroke controls must update the selected asset/object.
- Disabled controls must explain why they are disabled.
- Controls must not appear editable when no valid target is selected.
- Errors must be visible and actionable.

### Validation

- Select an editable object.
- Change fill/paint value.
- Confirm visual update.
- Change stroke value.
- Confirm visual update.
- Deselect object.
- Confirm controls disable with a useful message.

---

## 3. State Inspector JSON Usability

### Problem

The State Inspector must make JSON state easy to inspect and troubleshoot.

### Required Behavior

- JSON must be formatted/readable.
- Invalid JSON must show a clear parse error.
- Empty or missing state must show a safe empty state.
- Do not inject fake/sample state.
- Error messages must include enough information to help the user fix the input.

### Validation

- Load valid JSON and confirm formatted display.
- Load invalid JSON and confirm clear parse error.
- Load empty state and confirm empty-state message.
- Confirm no silent fallback/sample data appears.

---

## 4. Remove Silent Fallback Data

### Rule

Silent fallback data is not allowed.

If required data is missing, invalid, or unavailable, the tool must show actionable information instead of inventing or loading hidden fallback content.

### Required Error Pattern

Use clear messages that identify:

- What is missing or invalid
- Which tool/component detected it
- What the user can do next
- Any expected file/input shape, if known

### Examples

Good:

```txt
Vector Map Editor cannot load a map because no map manifest was provided. Choose or create a map manifest to continue.
```

Bad:

```txt
Loaded default sample map.
```

Good:

```txt
State Inspector could not parse JSON at line 12: unexpected token. Fix the JSON and reload.
```

Bad:

```txt
Using empty sample state.
```

---

## 5. Header Polish Follow-Up

From the prior header standardization PR, apply these refinements.

### Required Behavior

- Do NOT add a safe fallback that hides missing `shortDescription`.
- If `tool.name` or `tool.shortDescription` is missing, show an actionable configuration error.
- Apply hard max-width styling to prevent overflow.
- Lock font size and line height for header consistency.
- Add `data-tool-id` to the rendered header host/title for debugging and tests.

### CSS Requirements

- Header text remains one line.
- Header text does not wrap.
- Header text truncates with ellipsis.
- Header text uses locked font size and line height.

### Validation

- Temporarily remove `shortDescription` from one target tool and confirm a useful configuration error appears.
- Restore config.
- Confirm single-line header still truncates cleanly.
- Confirm `data-tool-id` exists in DOM.

---

## Acceptance Criteria

- No silent fallback data remains in the touched tools.
- Missing/invalid input produces actionable messages.
- Vector Map Editor opens in a clear, explicit state.
- Paint/fill and stroke controls work for valid selected objects.
- State Inspector handles valid, invalid, and empty JSON clearly.
- Fullscreen headers remain compact and single-line.
- Header CSS uses hard max width, locked font size, and locked line height.
- Header DOM includes `data-tool-id`.
- Existing validation commands pass.

---

## Out of Scope

- New tool features
- New game screens
- King of the Iceberg implementation
- Tileset breakout
- Runtime engine refactors
- start_of_day folder changes
