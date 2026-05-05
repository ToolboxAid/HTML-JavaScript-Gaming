# Preview Generator V2 Class Responsibilities - PR_26126_035

Preview Generator V2 keeps the current generation behavior while moving all tool-local CSS and JavaScript out of `index.html`. The HTML now links `previewGeneratorV2.css` and loads `previewGeneratorV2.bootstrap.js` as the local bootstrap module.

## Core Classes

- `tools/preview-generator-v2/PreviewGeneratorV2App.js` - `PreviewGeneratorV2App`: owns app startup, runtime-mode branch, event binding, generation run lifecycle, stop handling, and Generate Preview gating.
- `tools/preview-generator-v2/PreviewGeneratorV2Ui.js` - `PreviewGeneratorV2Ui`: owns UI control composition and delegates section behavior to the control classes.
- `tools/preview-generator-v2/PreviewGeneratorV2Logger.js` - `PreviewGeneratorV2Logger`: owns timestamped status/log output and clear behavior.
- `tools/preview-generator-v2/PreviewGeneratorV2Capture.js` - `PreviewGeneratorV2Capture`: owns Full Screen capture sizing helpers.
- `tools/preview-generator-v2/PreviewGeneratorV2RepoAccess.js` - `PreviewGeneratorV2RepoAccess`: owns File System Access API helper calls and repo destination naming.
- `tools/preview-generator-v2/PreviewGeneratorV2ShellControl.js` - `PreviewGeneratorV2ShellControl`: owns header/details hide-show and fullscreen shell state.

## UI Control Classes

- `tools/preview-generator-v2/controls/MenuSampleControl.js` - `MenuSampleControl`: owns the top NAV `Generate Preview` and `Stop` buttons.
- `tools/preview-generator-v2/controls/RepoDestinationControl.js` - `RepoDestinationControl`: owns `Repo Destination`, `Pick Repo Folder`, and `Repo selected` display.
- `tools/preview-generator-v2/controls/TargetSourceControl.js` - `TargetSourceControl`: owns `Target Source` radios and `Base URL`.
- `tools/preview-generator-v2/controls/AssetFolderControl.js` - `AssetFolderControl`: owns the `Asset folder` section/input.
- `tools/preview-generator-v2/controls/CaptureModeControl.js` - `CaptureModeControl`: owns the `Capture mode` radios.
- `tools/preview-generator-v2/controls/RenderControlsControl.js` - `RenderControlsControl`: owns `Wait before capture` and `Force rewrite`.
- `tools/preview-generator-v2/controls/PathsOrIdsControl.js` - `PathsOrIdsControl`: owns the `Paths or IDs` accordion textarea.
- `tools/preview-generator-v2/controls/LastGeneratedImageControl.js` - `LastGeneratedImageControl`: owns the `Last Generated Image` section and preview replacement.
- `tools/preview-generator-v2/controls/OutputSummaryControl.js` - `OutputSummaryControl`: owns `Output Summary`, `Write folder sample`, and `Write folder`.
- `tools/preview-generator-v2/controls/StatusControl.js` - `StatusControl`: owns the `Status` section and its `Clear` button binding.
- `tools/preview-generator-v2/controls/PreviewFrameControl.js` - `PreviewFrameControl`: owns the hidden preview iframe reference.

## Bootstrap

- `tools/preview-generator-v2/previewGeneratorV2.bootstrap.js`: imports the app and shell classes, then starts them. It intentionally contains only wiring.
