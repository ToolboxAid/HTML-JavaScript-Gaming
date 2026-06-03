# Tool Schemas

JSON schema contracts for tools, samples, and palettes belong here. Workspace Manager V2 uses game manifest validation plus manifest/toolState contract checks instead of a separate Workspace validation contract.

Root-level schema files should not be added.

## Layout

```text
toolbox/schemas/
  palette.schema.json
  samples
    sample.tool-payload.schema.json
  toolbox/
    <tool>.schema.json
```
