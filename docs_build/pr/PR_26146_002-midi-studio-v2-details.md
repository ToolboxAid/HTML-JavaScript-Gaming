# PR_26146_002-midi-studio-v2-details

## Scope

Defines MIDI Studio V2 requirements only. This PR does not add implementation code, runtime wiring, UI files, tests, samples, or engine changes.

## Purpose

MIDI Studio V2 is a first-class Workspace V2 tool for importing, previewing, organizing, directing, and exporting game music based on `.mid` assets. The tool exists to make MIDI-authored music usable by games while keeping gameplay runtime audio predictable and inexpensive.

## Requirements

- MIDI Studio V2 must be JavaScript-driven only.
- MIDI Studio V2 must support multiple MIDI songs declared in `game.manifest.json`.
- MIDI Studio V2 must play imported `.mid` files for tool preview and debugging.
- MIDI Studio V2 must include a Game Music Director mode for non-composers.
- MIDI Studio V2 must not include MIDI input, MIDI keyboard capture, or recording scope.
- MIDI Studio V2 must use manifest-owned music metadata as the persisted source of truth.
- MIDI Studio V2 must support rendered export targets for WAV, MP3, and OGG.
- Gameplay runtime should prefer rendered OGG or MP3 assets when live MIDI playback is too CPU-intensive.
- Live MIDI playback is primarily for tools, preview, and debugging.

## Out Of Scope

- No MIDI input device support.
- No recording workflow.
- No DAW replacement workflow.
- No runtime engine implementation.
- No sample JSON alignment.
- No Workspace Manager V2 registration in this PR.
- No generated audio assets in this PR.

## Manifest Ownership

`game.manifest.json` owns music metadata. The manifest should store file/path-oriented references and metadata required by tools and runtime. It must not persist binary MIDI or rendered audio payloads inline, and it must not use `imageDataUrl` or equivalent data URL fields for persisted project/runtime/workspace contracts.

Recommended ownership boundaries:

- `music.songs[]` owns song identity, source MIDI path, rendered asset paths, loop metadata, tags, mood, intensity, and intended gameplay usage.
- `tools.midi-studio-v2` owns tool-specific authoring preferences and selected song state when those values are part of the game manifest contract.
- Workspace/toolState storage may hold active editing state, but durable song metadata should be written back to the manifest-owned music section.

## Recommended Manifest Schema

The exact runtime schema can evolve during implementation, but future work should preserve these contract principles:

- Multiple songs are represented as an array.
- Every song has a stable `id`.
- Imported MIDI source uses a path field such as `sourceMidi`.
- Rendered gameplay assets use explicit path fields grouped by format.
- Runtime preference is declared without hiding fallback behavior.
- Tags and director metadata are manifest-owned and readable without launching the tool.

```json
{
  "music": {
    "version": 1,
    "runtimePreference": "rendered",
    "songs": [
      {
        "id": "theme-main",
        "name": "Main Theme",
        "sourceMidi": "assets/music/midi/theme-main.mid",
        "rendered": {
          "ogg": "assets/music/rendered/theme-main.ogg",
          "mp3": "assets/music/rendered/theme-main.mp3",
          "wav": "assets/music/rendered/theme-main.wav"
        },
        "defaultRuntimeFormat": "ogg",
        "loop": {
          "enabled": true,
          "startSeconds": 1.2,
          "endSeconds": 62.4
        },
        "director": {
          "mood": "heroic",
          "intensity": "medium",
          "usage": ["title", "menu"],
          "notes": "Bright opening cue for the first player-facing screen."
        },
        "tags": ["theme", "menu", "heroic"]
      },
      {
        "id": "combat-light",
        "name": "Light Combat",
        "sourceMidi": "assets/music/midi/combat-light.mid",
        "rendered": {
          "ogg": "assets/music/rendered/combat-light.ogg",
          "mp3": "assets/music/rendered/combat-light.mp3",
          "wav": "assets/music/rendered/combat-light.wav"
        },
        "defaultRuntimeFormat": "ogg",
        "loop": {
          "enabled": true,
          "startSeconds": 0,
          "endSeconds": 48
        },
        "director": {
          "mood": "tense",
          "intensity": "high",
          "usage": ["combat", "encounter"],
          "notes": "Short loop for early combat encounters."
        },
        "tags": ["combat", "loop", "tense"]
      }
    ]
  },
  "tools": {
    "midi-studio-v2": {
      "activeSongId": "theme-main",
      "directorMode": {
        "enabled": true,
        "defaultIntensity": "medium"
      }
    }
  }
}
```

## Alternate Compact Manifest Example

For small games, rendered asset entries may omit unavailable formats while keeping the source MIDI and stable song IDs.

```json
{
  "music": {
    "version": 1,
    "runtimePreference": "rendered",
    "songs": [
      {
        "id": "ambient-cave",
        "name": "Ambient Cave",
        "sourceMidi": "assets/music/midi/ambient-cave.mid",
        "rendered": {
          "ogg": "assets/music/rendered/ambient-cave.ogg"
        },
        "defaultRuntimeFormat": "ogg",
        "loop": {
          "enabled": true
        },
        "director": {
          "mood": "mysterious",
          "intensity": "low",
          "usage": ["level", "exploration"]
        },
        "tags": ["ambient", "cave"]
      }
    ]
  }
}
```

## Runtime Expectations

Gameplay runtime should treat rendered audio as the preferred path when live MIDI playback would be too CPU-intensive or inconsistent across browsers. Runtime selection should be explicit:

- Prefer `defaultRuntimeFormat` when the file exists and the browser can play it.
- Prefer OGG for gameplay when supported.
- Use MP3 as the broad compatibility fallback when OGG is unavailable.
- Treat WAV as an export/mastering target unless a game explicitly opts into it.
- Do not silently switch to live MIDI if rendered assets are missing.
- Report missing rendered assets as visible validation or runtime diagnostics.

Live MIDI playback remains valuable for:

- imported `.mid` preview;
- tool-side arrangement inspection;
- debugging tempo, loop, and channel metadata;
- export comparison against rendered targets.

## Game Music Director Mode

Game Music Director mode should help non-composers choose, organize, and prepare songs without requiring music theory or DAW knowledge.

Expected future capabilities:

- browse songs by mood, intensity, usage, and tags;
- recommend title, menu, level, encounter, combat, victory, defeat, and ambient usage categories;
- show whether each song has source MIDI and rendered gameplay assets;
- expose loop and runtime readiness status in plain language;
- support simple notes for intent and scene placement;
- avoid editing workflows that imply MIDI recording or performance capture.

Game Music Director mode should write durable decisions to manifest-owned music metadata, not hidden local storage or disconnected tool-only state.

## First-Class Tool Lifecycle Notes

Future MIDI Studio V2 implementation should follow the First-Class Tool Lifecycle Contract from `docs_build/dev/PROJECT_INSTRUCTIONS.md`.

Implementation notes for a future PR:

- Create the tool under `tools/midi-studio-v2/`.
- Start from `tools/_templates-v2`.
- Preserve template headers, NAV, panels, accordions, status/logging, CSS wiring, JS bootstrapping, and accessibility structure.
- Register through existing first-class tool patterns in `tools/index.html` and `tools/workspace-manager-v2/index.html`.
- Participate in Workspace Manager V2 launch/navigation patterns.
- Support dirty-state handling and save/cancel lifecycle behavior.
- Validate manifest and toolState payloads before render.
- Reject invalid MIDI/music metadata without partial render.
- Log import, preview, export, missing file, and unsupported format failures visibly.
- Keep CSS and JavaScript external.
- Do not introduce an isolated persistence system.
- Do not introduce an alternate launch/navigation system.

## Validation

Playwright impacted: No.

No Playwright impact. This PR is docs/spec only.

Required validation:

- `git diff --check`

Full samples smoke test is skipped because this PR changes only documentation and does not affect sample loading, shared sample framework behavior, or sample runtimes.
