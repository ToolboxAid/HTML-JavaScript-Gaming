# PR_26152_055 Theme V2 Tool Shell Gaps

## Mapped in this PR
The 11 simple root public tool pages were mapped because their existing shell already had stable left, center, and right regions. The safe change was limited to putting existing descriptive copy into the existing center work-area paragraph.

## Status/log handling
The fixed public shell currently exposes the right column `Output` accordion as the output/status region. Adding a distinct status/log section would require changing accordion structure, which this PR explicitly forbids. No separate status/log section was added.

## Skipped root tool surfaces
These `/tools/**` pages were intentionally skipped because content mapping would require changing shell structure, shell classes, IDs, CSS, runtime behavior, or tool-specific layout:

- First-Class Tool V2/runtime shells: `tools/_templates-v2/index.html`, `tools/workspace-manager-v2/index.html`, `tools/asset-manager-v2/index.html`, `tools/object-vector-studio-v2/index.html`, `tools/world-vector-studio-v2/index.html`, `tools/palette-manager-v2/index.html`, `tools/preview-generator-v2/index.html`, `tools/audio-sfx-playground-v2/index.html`, `tools/collision-inspector-v2/index.html`, `tools/input-mapping-v2/index.html`, `tools/midi-studio-v2/index.html`, `tools/storage-inspector-v2/index.html`, and `tools/text2speech-V2/index.html`.
- Runtime/editor pages with custom local shells: `tools/Sprite Editor/index.html`, `tools/Tilemap Studio/index.html`, `tools/Parallax Scene Studio/index.html`, `tools/State Inspector/index.html`, `tools/Physics Sandbox/index.html`, `tools/Performance Profiler/index.html`, `tools/3D JSON Payload/index.html`, `tools/3D Asset Viewer/index.html`, `tools/3D Camera Path Editor/index.html`, `tools/Asset Pipeline/index.html`, and `tools/Replay Visualizer/index.html`.
- Documentation/helper pages such as `how_to_use.html` files and `tools/shared/preview/*.html`; they are documentation/helper surfaces, not the fixed public tool shell targeted here.

## Theme V2 shell gap
The affected fixed shell still depends on existing shell CSS loaded through the current page stylesheet. Converting this shell to Theme V2 without changing class names, accordion structure, center header structure, or image sizing/layout requires an approved reusable Theme V2 tool-shell pattern first. That migration was skipped in this PR because CSS changes and shell/class changes are explicitly out of scope.

## Future candidates
- Approve a reusable Theme V2 public tool-shell pattern that preserves fixed shell semantics.
- Define a Theme V2 status/log region that can be added without disrupting existing accordions.
- Handle runtime/first-class tool shells in dedicated per-tool or per-template PRs with behavior validation.
