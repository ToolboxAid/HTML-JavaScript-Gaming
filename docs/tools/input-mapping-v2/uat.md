# Input Mapping V2 UAT

## Launch

- Open `tools/input-mapping-v2/index.html`.
- Confirm the tool header, Actions, Capture, Mappings, Mapping JSON, Devices, and Status panels appear.
- Confirm workspace launch mode shows a Return to Workspace action.

## Keyboard Capture

- Select `Move Left`.
- Click `Capture Keyboard`.
- Press `ArrowLeft`.
- Confirm the mapping list and JSON output include `moveLeft` with `ArrowLeft`.

## Gamepad Capture

- Connect a gamepad.
- Press or hold a button or axis.
- Click `Capture Gamepad`.
- Confirm the mapping list and JSON output include the detected gamepad input.

## Device Refresh

- Click `Refresh Devices`.
- Confirm keyboard availability is shown.
- Confirm connected gamepads are listed with button and axis counts.
