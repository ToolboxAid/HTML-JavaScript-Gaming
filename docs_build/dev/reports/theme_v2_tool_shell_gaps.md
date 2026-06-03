# PR_26152_055 Theme V2 Tool Shell Gaps

## Mapped in this PR
The 11 simple root public tool pages were mapped because their existing shell already had stable left, center, and right regions. The safe change was limited to putting existing descriptive copy into the existing center work-area paragraph.

## Status/log handling
The fixed public shell currently exposes the right column `Output` accordion as the output/status region. Adding a distinct status/log section would require changing accordion structure, which this PR explicitly forbids. No separate status/log section was added.

## Skipped root tool surfaces
These `/toolbox/**` pages were intentionally skipped because content mapping would require changing shell structure, shell classes, IDs, CSS, runtime behavior, or tool-specific layout:

- First-Class Tool V2/runtime shells: `toolbox/_tool_template-v2/index.html`, `toolbox/workspace-manager-v2/index.html`, `toolbox/asset-manager-v2/index.html`, `toolbox/object-vector-studio-v2/index.html`, `toolbox/world-vector-studio-v2/index.html`, `toolbox/palette-manager-v2/index.html`, `toolbox/preview-generator-v2/index.html`, `toolbox/audio-sfx-playground-v2/index.html`, `toolbox/collision-inspector-v2/index.html`, `toolbox/input-mapping-v2/index.html`, `toolbox/midi-studio-v2/index.html`, `toolbox/storage-inspector-v2/index.html`, and `toolbox/text2speech-V2/index.html`.
- Runtime/editor pages with custom local shells: `toolbox/Sprite Editor/index.html`, `toolbox/Tilemap Studio/index.html`, `toolbox/Parallax Scene Studio/index.html`, `toolbox/State Inspector/index.html`, `toolbox/Physics Sandbox/index.html`, `toolbox/Performance Profiler/index.html`, `toolbox/3D JSON Payload/index.html`, `toolbox/3D Asset Viewer/index.html`, `toolbox/3D Camera Path Editor/index.html`, `toolbox/Asset Pipeline/index.html`, and `toolbox/Replay Visualizer/index.html`.
- Documentation/helper pages such as `how_to_use.html` files and `toolbox/shared/preview/*.html`; they are documentation/helper surfaces, not the fixed public tool shell targeted here.

## Theme V2 shell gap
The affected fixed shell still depends on existing shell CSS loaded through the current page stylesheet. Converting this shell to Theme V2 without changing class names, accordion structure, center header structure, or image sizing/layout requires an approved reusable Theme V2 tool-shell pattern first. That migration was skipped in this PR because CSS changes and shell/class changes are explicitly out of scope.

## Future candidates
- Approve a reusable Theme V2 public tool-shell pattern that preserves fixed shell semantics.
- Define a Theme V2 status/log region that can be added without disrupting existing accordions.
- Handle runtime/first-class tool shells in dedicated per-tool or per-template PRs with behavior validation.
