# PLAN_PR: Tool / Workspace Schema + Manifest Boundary Cleanup

## Purpose

Make tool data, sample data, workspace data, palette rules, and valid UI actions explicit through schemas and manifests instead of scattered validation code or hidden payload builders.

## Scope

One PR only:

- Remove/replace remaining dependency paths around:
  - `buildDefaultPayload`
  - 3D Camera Path Editor legacy payload assumptions
  - 3D JSON payload normalizer legacy assumptions
  - Viewer assets being separately saved/exported outside manifests
- Introduce actual `*.schema` files for tool/workspace/sample payload validation.
- Clarify palette behavior:
  - Samples use named palettes only.
  - Samples are locked and cannot mutate palettes.
  - Workspaces use duplicated palettes.
  - Once a workspace palette swatch is used, that palette cannot be replaced with a different palette.
  - Used workspace palettes may allow swatch edits only.
  - Other palettes may be viewed for reference/copying swatches into the selected workspace palette.
- Put all workspace-owned assets in `workspace.manifest`.
- Allow only exportable/rendered artifacts such as PNG files to be saved/exported outside the manifest.
- Ensure UI buttons/actions are enabled by loaded context:
  - Tool-loaded context enables only tool-valid actions.
  - Workspace-loaded context enables only workspace-valid actions.

## Non-Goals

- Do not rewrite tool implementations.
- Do not change sample runtime behavior except where required to load schema-backed data.
- Do not modify `start_of_day` folders.
- Do not delete legacy folders unless explicitly approved.
- Do not add repo-wide validation frameworks if smaller local schema files are enough.
- Do not implement new editor features beyond the boundary cleanup.

## Desired Manifest Shape

Workspace:

```json
{
  "palette": {},
  "tools": {
    "<tool>": {
      "tool data": {}
    }
  }
}
```

Sample tool payload files:

```json
{
  "<tool>": {
    "tool data": {}
  }
}
```

The sample payload shape should match the same tool schema used by the tool manifest loader.

## Acceptance Criteria

- `buildDefaultPayload` is no longer required for current tool/sample/workspace loading paths, or it is reduced to a compatibility shim with clear deprecation comments.
- Each active tool has a dedicated schema file.
- Workspace manifest has a schema file.
- Sample tool payloads validate against the same schema used by the corresponding tool.
- Viewer/vector assets that belong to a workspace are stored inside `workspace.manifest`.
- PNG or rendered output remains exportable outside the manifest.
- Samples are locked to named palettes and cannot mutate palette data.
- Workspaces duplicate palettes and enforce swatch-use locking rules.
- UI action availability is derived from loaded context and schema capabilities, not hard-coded workspace/tool assumptions.
- Existing samples continue to load.
- `samples/index.html` is updated only if sample entries are changed.
