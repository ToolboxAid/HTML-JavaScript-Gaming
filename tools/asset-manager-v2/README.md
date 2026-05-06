# Asset Manager V2

Asset Manager V2 is an asset-only First-Class Tool V2 surface. It creates and validates approved image, audio, and font entries against `tools/schemas/tools/asset-browser.schema.json`.

The tool has no dependency on the legacy `tools/Asset Browser` implementation and does not discover or enumerate all tools. In Workspace V2 launch mode, validated entries are written only to `tools.asset-browser.assets` in the Workspace V2 manifest context.

Validation for this BUILD is covered by:

```text
npm run test:workspace-v2
```
