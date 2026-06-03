# PR_26145_013 Audio SFX Rebalanced Layout

## Scope

- Updated `tools/audio-sfx-playground-v2` only.
- Rebalanced Audio / SFX Playground V2 so the left column now holds Name, Sound Style, selected style description, examples, helper text, and validation status.
- Moved Wave controls and all oscillator sliders into the center Sound Design work area.
- Moved Add Noise Layer and noise sliders into the right side of the center Sound Design work area.
- Preserved the right-column Wave Preview, Output Summary, and Status accordions.
- Preserved JSON action controls, style clamps, helper text, recommended zones, and slider focus behavior.
- No `start_of_day` folders were modified.

## Targeted Static Validation

PASS:

- `Get-ChildItem -Recurse -File tools/audio-sfx-playground-v2/js -Filter *.js | ForEach-Object { node --check $_.FullName }`
- HTML/CSS/JS static guard:
  - no `<style>` blocks in `tools/audio-sfx-playground-v2/index.html`
  - no inline `<script>` blocks
  - no inline event handlers
  - center `#soundDesignContent` exists
  - Wave and Noise control groups exist in the center work area
  - moved Wave/Noise controls no longer appear inside left `#sfxShapeContent`
  - right-column accordion content IDs remain present
  - side-by-side control grid CSS is present
- `git diff --check -- tools/audio-sfx-playground-v2`
  - PASS with Git LF/CRLF warnings only for `index.html` and `audioSfxLayoutDensity.css`.

## Focused Playwright Validation

PASS using a local repo HTTP server and Chromium:

- Audio / SFX Playground V2 launched at `/tools/audio-sfx-playground-v2/index.html`.
- No console errors and no page errors.
- Left-column setup alignment passed:
  - Name and Sound Style labels aligned.
  - Name input and Sound Style select aligned.
  - Style description, examples, and helper text align with the style control column.
- Center layout passed:
  - Wave controls moved into `#soundDesignContent`.
  - Noise/Add Noise Layer controls moved into `#soundDesignContent`.
  - Wave and Noise control groups are side by side and top-aligned.
  - Center control grid does not visibly overflow its parent.
- Slider layout passed:
  - All 9 slider rows remained single-line with label, slider, value, and range hints.
  - No visible bounds overflow was detected for the Sound Design content, control groups, or right-column accordions.
- Right-column accordions passed:
  - Wave Preview collapsed and expanded.
  - Output Summary collapsed and expanded.
  - Status collapsed and expanded.
- Behavior preservation passed:
  - Slider focus remained on `#durationInput` after click.
  - `ArrowRight` changed duration from `1065` to `1070`, preserving the 5 ms step.
  - TTL Arcade clamp remained `80` / `2500` with recommended zone `841-1519 Hz`.
  - Import JSON, Copy JSON, and Export JSON buttons remained present.

V8 coverage entries captured:

- `tools/audio-sfx-playground-v2/js/bootstrap.js`
- `tools/audio-sfx-playground-v2/js/controls/SfxControlPanel.js`

## Workspace V2 Validation

Command:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='.ms-playwright'; npm.cmd run test:workspace-v2
```

Result:

- Timed out after 900 seconds.
- Observed 67 passing tests before timeout.
- Observed failing/problem tests before timeout:
  - `Workspace Manager V2 bootstrap > shows Object Vector Studio V2 layout shell and schema-only palette gate`
  - `Workspace Manager V2 bootstrap > compacts Object Vector Studio V2 geometry layouts and selected palette state`
- Tests after item 67 were not reached before the command timeout.

These observed failures/timeouts are outside the Audio / SFX Playground V2 scope.

## Full Samples Smoke

Skipped per BUILD request because this PR only impacts Audio / SFX Playground V2 layout.
