# Restart Notes — PR 11.123

Current issue:
- Palette schema details were moved into workspace.manifest.schema.json.
- Revert that. Workspace manifest should reference palette-browser schema, not contain palette internals.

Target boundary:
- Workspace/game validates parent document only.
- Tool validates direct tool JSON only.
- Workspace Manager routes exact referenced payload to tool, no conversion.
