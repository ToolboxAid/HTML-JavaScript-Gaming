# PR_26152_275 Storage Inspector Template Mapping

## Scope

This report documents the future Storage Inspector mapping to the corrected `_tool_template_v2` layout. Storage Inspector was not rebuilt in this PR.

## Future Mapping

| Template Region | Storage Inspector Responsibility |
| --- | --- |
| Left column | Persistent selector for what to inspect. |
| Center column | `toolDisplayMode` host for tiles, list, tree, and JSON summary display modes. |
| Right column | Selected memory/store record content, status, diagnostics, metadata, and details. |

## Left Column Selection Targets

- Session
- Local
- Project Store
- Runtime
- Tool State
- Manifest
- Custom Extensions

## Center Column Display Modes

- Tiles summary
- List summary
- Tree summary
- JSON summary

## Right Column Details

- Selected record content
- Selected record metadata
- Validation status
- Diagnostics
- Detail output

## Boundaries

- No Storage Inspector runtime code changed.
- No Storage Inspector page rebuild was performed.
- No sample files were touched.
- No new CSS or Theme V2 CSS changes were made.
