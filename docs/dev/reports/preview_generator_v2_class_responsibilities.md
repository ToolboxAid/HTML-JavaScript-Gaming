# Preview Generator V2 Class Responsibilities - PR_26126_034

Preview Generator V2 keeps the existing generation flow and output behavior intact while moving the active runtime script out of the HTML page and into `tools/preview-generator-v2/previewGeneratorV2.js`.

- `PreviewGeneratorV2App`: owns startup, runtime-mode selection, event binding, run lifecycle, stop handling, and Generate Preview gating.
- `PreviewGeneratorV2Ui`: owns DOM-facing UI state, including repo display, Generate Preview button state, selected target/capture controls, and the Last Generated Image preview.
- `PreviewGeneratorV2Capture`: owns capture-specific sizing logic used by Full Screen capture paths.
- `PreviewGeneratorV2RepoAccess`: owns File System Access API handle helpers and repo destination display naming.
- `PreviewGeneratorV2Logger`: owns the status/log output surface and clear behavior.

Legacy `tools/preview` is removed. `tools/preview-generator-v2` remains the active registered tool.
