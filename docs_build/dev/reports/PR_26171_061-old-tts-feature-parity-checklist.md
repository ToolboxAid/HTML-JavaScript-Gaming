# PR_26171_061 Old TTS Feature Parity Checklist

Functionality sample: `archive/v1-v2/tools/old_text2speech-V2/`

## Controls And Options

- PASS: Gender helper filter restored.
- PASS: Language filter restored.
- PASS: Voice dropdown restored.
- PASS: Voice details restored.
- PASS: Voice Age select restored.
- PASS: Character Preset select restored.
- PASS: SSML-like Preset select restored.
- PASS: Volume slider restored with visible value.
- PASS: Rate / Speed slider restored with visible value.
- PASS: Pitch slider restored with visible value.
- PASS: Name field restored.
- PASS: Text To Speak editor restored.

## Queue And JSON

- PASS: Named Sentences queue restored.
- PASS: Add named sentence restored.
- PASS: Duplicate named sentence restored.
- PASS: Delete named sentence restored.
- PASS: Output Summary JSON restored.
- PASS: Import JSON restored for standalone launch.
- PASS: Copy JSON restored for standalone launch.
- PASS: Export JSON restored for standalone launch.
- PASS: URL JSON source loading restored through `samplePresetPath`.

## Playback And Status

- PASS: Speak restored.
- PASS: Pause restored when browser support exists.
- PASS: Resume restored when browser support exists.
- PASS: Stop restored.
- PASS: Clearable status log restored.
- PASS: Actionable unavailable-browser error restored.
- PASS: No placeholder provider-blocking behavior remains for browser preview.

## Workspace

- PASS: Project Workspace launch detection restored.
- PASS: Standalone JSON actions hide during Project Workspace launch.
- PASS: Return to Project Workspace action restored.
- PASS: Project Workspace toolState loading restored.
- PASS: Project Workspace dirty-state writeback restored.
