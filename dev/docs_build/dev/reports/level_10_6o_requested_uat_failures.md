# Level 10.6O Requested UAT Failures

User-reported failures to fix:

- All tools: accordion closes about 1 second after opening.
- Asset Browser / Import Hub: 0 approved assets.
- Tilemap Studio: map not loaded; tile readiness uncertain.
- Vector Asset Studio: palette, paint, and stroke not loaded.
- Samples 1215, 1216, 1217 load SVG Background Canvas but are missing palette.
- Vector Map Editor: no data loaded.
- Samples 1212, 1213, 1214 are working and must not regress.

This PR is a targeted stabilization PR. It must not broaden into new architecture or unrelated tool cleanup.
