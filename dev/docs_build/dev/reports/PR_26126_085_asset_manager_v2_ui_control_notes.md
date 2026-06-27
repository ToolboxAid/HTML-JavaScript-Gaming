# PR_26126_085 Asset Manager V2 UI Control Notes

Date: 2026-05-06

## Controls

- Restored Kind radio buttons for `image`, `audio`, `font`, `video`, `shader`, `data`, and `localization`.
- The single `Pick Asset File` control remains, but its accept filter now follows the selected Kind.
- Renamed `Approved Kind` to `Kind`.
- Removed visible Source from Asset Controls.
- Role remains a dropdown, with options rebuilt from the selected Kind.
- Role defaults by Kind:
  - image: `sprite`
  - audio: `sound`
  - font: `ui`
  - video: `cutscene`
  - shader: `fragment`
  - data: `config`
  - localization: `strings`
- Renamed `Asset ID` to `ID`.
- ID and Path textboxes now stack under their labels.
- The final button remains labeled `Add Asset`.

## Behavior

- Changing Kind updates the picker accept filter and resets Role to the likely default for that Kind.
- Changing Role after selecting a file regenerates the ID and revalidates the selected file entry.
- Picking a file assigns ID from Kind, filename slug, and Role.
- Picking a file assigns Path from the selected path normalized from the project root, with kind-folder fallback when no project-root path is available.
