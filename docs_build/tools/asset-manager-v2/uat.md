# Asset Manager V2 - UAT

Validate that Asset Manager V2 is the active V2 surface for authoring and validating manifest-owned assets.

## Scope
- Tool: `asset-manager-v2`
- Entry point: `tools/asset-manager-v2/index.html`
- Purpose: create and validate audio, color, data, font, image, localization, shader, and video asset entries for V2 workspace and game manifest flows.

## Expected
- Tool launches from the tools index.
- Tool launches from Workspace Manager V2 when selected game context enables it.
- Asset entries remain owned by the Asset Manager V2 manifest/toolState contract.
