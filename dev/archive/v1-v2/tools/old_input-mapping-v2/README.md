# Input Mapping V2

Input Mapping V2 is a First-Class Tool V2 surface for mapping keyboard, mouse, and gamepad inputs to reusable actions.

## Scope

- Uses the official `tools/templates-v2/` shell, menu, panel, accordion, and status conventions.
- Imports engine input sources from `src/engine/input/**`.
- Captures keyboard keys, mouse buttons, gamepad buttons, and gamepad axes where the browser exposes live values.
- Uses `InputMap` as the action-to-physical-input mapping model.
- Supports captured input deletion by clicking the captured input token.

## Template Source

Input Mapping V2 was rebuilt from the current official Tool Template V2 for PR_26140_087.
