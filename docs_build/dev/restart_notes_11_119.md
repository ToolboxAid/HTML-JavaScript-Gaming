# Restart Notes — PR 11.119

Evidence:
- The bad link is rendered by `samples/index.render.js`.
- `0201` metadata reportedly has empty `toolHints` and `roundtripToolPresets`.
- Therefore the renderer/runtime is using stale data or inference.

Fix:
- `samples/metadata/samples.index.metadata.json` is the only SSoT.
- Renderer must not infer/fallback tool links.
- Empty arrays render no roundtrip section.
