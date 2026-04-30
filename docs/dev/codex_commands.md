# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_119_SAMPLE_METADATA_SSOT_AND_RENDERER_GUARD_REMOVAL

## Execute

1. Treat this as the correction to PR 11.118.

2. Confirm the active sample tile renderer path:
   - inspect `samples/index.render.js`
   - inspect any imports/loaders used by that renderer

3. Make this the only SSoT for sample tile tool roundtrip links:
   - `samples/metadata/samples.index.metadata.json`

4. Remove renderer/toolhint logic that can create roundtrip links from anything except:
   - `toolHints`
   - `roundtripToolPresets`
   in the metadata SSoT file.

5. Remove logic that:
   - infers tool hints from sample ids
   - infers tool hints from sample titles
   - infers tool hints from sample paths
   - infers tool hints from JSON files in sample folders
   - uses fallback/default tool hint arrays
   - uses samples2tools as active sample tile source
   - restores stale/generated tool links

6. Ensure empty arrays mean no rendered section:
   - `toolHints: []`
   - `roundtripToolPresets: []`
   must render no `sample-tool-roundtrip` section.

7. Delete or disable stale duplicate source files that can feed sample tile tool links outside the SSoT.
   - If unsafe to delete, remove runtime loading and report why file remains.

8. Validate these known-bad links cannot render:
   - 0201: 3D Camera Path Editor or unrelated Open Tool links
   - 0202: unrelated Open Tool links
   - 0204: unrelated Open Tool links
   - 0210: unrelated Open Tool links
   - 0220: unrelated Open Tool links
   - 0221: 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
   - 0226: unrelated Open Tool links
   - 0227: unrelated Open Tool links
   - 0303: unrelated Open Tool links
   - 0305: 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
   - 0901: Vector Map Editor
   - 1204: SVG Asset Studio
   - 1205: Vector Map Editor
   - 1208: 3D Asset Viewer and SVG Asset Studio
   - 1319: unrelated Open Tool links

9. Do not add a runtime hardcoded denylist as the final fix.
   - A temporary validation assertion is allowed only in tests/reports.

10. Do not:
   - add fake data
   - add fallback/default/preset inputs
   - reintroduce normalization
   - reintroduce inference
   - delete samples

11. Validate:
   - changed JSON parses
   - changed JS syntax is valid
   - 0201 metadata empty arrays render no roundtrip section
   - known-bad links absent from active runtime-loaded source
   - no second active source remains

12. Write populated reports:
   - docs/dev/reports/sample_metadata_ssot_11_119.txt
   - docs/dev/reports/renderer_toolhint_cleanup_11_119.txt
   - docs/dev/reports/stale_roundtrip_sources_11_119.txt
   - docs/dev/reports/known_bad_links_validation_11_119.txt

13. Reports must include:
   - files searched
   - files changed
   - exact removed logic
   - chosen SSoT
   - validation evidence for 0201
   - blockers if any

14. Roadmap:
   - status-only update if execution-backed
   - do not rewrite roadmap text
   - do not delete roadmap text

15. Package Codex output ZIP at:
   tmp/PR_11_119_SAMPLE_METADATA_SSOT_AND_RENDERER_GUARD_REMOVAL.zip
