# Tool Template V2 Control And Service Contracts

These contracts define the required structure for First-Class Tool V2 code created from Tool Template V2.

## Deprecated Shared Tool Surface

`tools/shared/` is deprecated for First-Class Tool V2 surfaces.

First-Class Tool V2 surfaces must have:

- no imports from `tools/shared/`
- no script references to `tools/shared/`
- no CSS references to `tools/shared/`
- no runtime dependency on `tools/shared/`

## Control Contract

Controls own one UI control or one UI section.

Required rules:

- One control or section per class.
- One class per file.
- A control owns its DOM references.
- A control owns its event binding.
- A control must not reach into sibling controls directly.
- A control must not perform unrelated business logic.
- A control exposes clear methods that match its responsibility.

Common methods:

- `init()` or `mount()` prepares the control.
- `bindEvents()` wires DOM events when event wiring is separate from initialization.
- `getValue()` returns the current control value when applicable.
- `setValue(value)` updates the control value when applicable.
- `validate()` returns validation status and messages when applicable.
- `setEnabled(isEnabled)` updates enabled state when applicable.
- `clear()` clears visible state when applicable.

Controls communicate through injected callbacks, injected services, or the app/root coordinator. A control must not directly edit another control's DOM or internal state.

## Panel Role Contract

First-Class Tool V2 surfaces use a consistent three-column layout contract:

- Left panel owns user input, setup, and intent controls only.
- Center panel owns the primary work surface, editor, canvas, or preview.
- Right panel owns generated output, summaries, diagnostics, logs, and status.
- Status and log controls belong at the bottom of the right panel unless a PR explicitly justifies a different placement.

Controls should be placed according to these panel roles before adding new sections. A control that mixes input and output responsibilities should be split into separate controls.

## Service Contract

Services contain non-DOM logic.

Required rules:

- Services must not query or manipulate UI directly.
- Services must not write to status text, textareas, headers, buttons, or panels.
- Services return data, status objects, or errors for controls, the app/root coordinator, or logger to display.
- Services must avoid hidden defaults and silent fallback data.
- Services should be deterministic for the same input unless they explicitly own I/O.

Recommended result shape:

```js
{
  ok: true,
  value: {},
  warnings: []
}
```

Recommended error shape:

```js
{
  ok: false,
  code: "VALIDATION_FAILED",
  message: "Explain the actionable failure.",
  details: {}
}
```

## App/Root Contract

The app/root class is a coordinator only.

Required rules:

- The app/root class wires controls and services.
- The app/root class coordinates flows between controls and services.
- The app/root class does not own DOM references except for constructing controls when unavoidable.
- The app/root class does not own business logic.
- The app/root class does not write directly to log/status UI.
- The app/root class does not reach into control internals.

Allowed responsibilities:

- instantiate controls and services
- inject dependencies
- connect callbacks
- coordinate high-level flows such as load, validate, render, export
- route service results to the owning control or logger

## Logger Contract

Each tool has one status/log writer.

Required rules:

- Logger is the single writer for status/log output.
- Controls, services, and app/root code must route log output through the logger.
- Logger owns status/log DOM writes.
- Logger supports these levels:
  - `OK`
  - `WARN`
  - `FAIL`
  - `SKIP`
  - `INFO`
- Logger entries must be clear and actionable.
- Batch operations must include the item identifier in per-item log lines.

Recommended logger methods:

- `ok(message)`
- `warn(message)`
- `fail(message)`
- `skip(message)`
- `info(message)`
- `clear()`

## Batch Processor Contract

Batch processors handle repeated work across discovered inputs.

See `BATCH_GUARDRAIL_CONTRACT.md` for the full batch guardrail contract.

Required rules:

- Process real discovered inputs only.
- Never assume numeric sequences.
- Log every item through the logger with `OK`, `WARN`, `FAIL`, or `SKIP`.
- One item failure must not stop the batch unless the failure is global.
- Missing inputs are `SKIP` during batch processing.
- Batch failures identify the exact item and underlying error.
- Batch summaries include written, failed, skipped, and warnings.
- Long-running batches support stop or cancel when applicable.

Recommended summary shape:

```js
{
  written: 0,
  failed: 0,
  skipped: 0,
  warnings: 0,
  items: []
}
```

## Review Checklist

Before a First-Class Tool V2 PR is ready:

- Every control or section has its own class.
- Every service is DOM-free.
- The app/root class coordinates only.
- All logging goes through the logger.
- Batch work logs per item and summarizes counts.
- No inline event handlers exist in HTML.
- No inline `<script>` or `<style>` blocks exist in HTML.
- No `tools/shared/` dependency exists.
