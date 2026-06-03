# Input Mapping V2 UAT

## Launch

- Open `toolbox/input-mapping-v2/index.html`.
- Confirm the tool header, Actions, Capture, Mappings, Mapping JSON, Devices, and Status panels appear.
- Confirm workspace launch mode shows a Return to Workspace action.

## Keyboard Capture

- Select `Move Left`.
- Click `Capture Keyboard`.
- Press `KeyA`.
- Confirm the mapping list and JSON output include `moveLeft` with `Keyboard KeyA`.
- Click the `Keyboard KeyA` captured input token.
- Confirm the mapping is deleted.

## Default Actions

- Confirm the default actions include movement, confirm/cancel, fire, thrust, and rotation actions.
- Confirm `Pause`, `Select`, and `Start` are present in the default action dropdown.
- Confirm default actions are sorted alphabetically.

## Gamepad Capture

- Connect a gamepad.
- Press or hold a button or axis.
- Click `Capture Gamepad`.
- Confirm the mapping list and JSON output include the detected gamepad input.
- If the browser does not expose a live gamepad value, confirm the Status log shows an actionable WARN.

## Device Refresh

- Confirm Engine Input Sources lists `InputService + KeyboardState`, `InputService + MouseState`, `InputService + GamepadState + GamepadInputAdapter`, and `GamepadInputAdapter`.
