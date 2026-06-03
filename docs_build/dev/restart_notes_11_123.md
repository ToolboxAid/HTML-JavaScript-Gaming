# Restart Notes — PR 11.123

Current issue:
- Palette schema details were moved into the old Workspace validation contract.
- Revert that. Workspace Manager should route palette payloads to the palette tool contract, not contain palette internals in a separate Workspace validation contract.

Target boundary:
- Workspace/game validates parent document only.
- Tool validates direct tool JSON only.
- Workspace Manager routes exact referenced payload to tool, no conversion.
