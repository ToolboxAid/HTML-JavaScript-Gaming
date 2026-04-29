# PR 11.49 Prompt Notes

Use the upgraded audit script as signal only. The script does not decide deletion.

Decision rules:
- If directly referenced by JS: keep.
- If indirectly used by manifest/tool runtime: keep and document.
- If clearly in wrong sample: move only when the destination is obvious and targeted validation supports it.
- If no direct or indirect usage exists: delete.

Safe targets are tool-specific JSON payloads such as profiler, replay, pipeline, and 3D tool fixtures.

Do not touch palette, tile map editor document, or sample 1902 in this PR.
