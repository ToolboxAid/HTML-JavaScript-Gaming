# Tool Missing Functionality Matrix

## Scope
This register captures quality gaps from the 21.3 automation pass. It is intentionally focused on automation and quality baseline coverage, not feature redesign.

| Tool Surface | Capability Area | Expected Behavior | Current Behavior | Gap Summary | Priority | Recommended Next Implementation Lane |
| --- | --- | --- | --- | --- | --- | --- |
| 3D Asset Viewer | Deep workflow automation | Deterministic automated open/edit/export coverage. | Boot/load smoke only. | No automated workflow-level assertions yet. | Medium | Add fixture-driven 3D asset workflow test lane. |
| 3D Camera Path Editor | Deep workflow automation | Deterministic import/edit/export path test. | Boot/load smoke only. | Path editing/export correctness not automatically validated. | Medium | Add camera path fixture round-trip test lane. |
| 3D Map Editor | Deep workflow automation | Automated map load/edit/save contract checks. | Boot/load smoke only. | No automated map-document persistence checks. | Medium | Add deterministic map-document round-trip test lane. |
| Asset Browser / Import Hub | Import-handoff automation | Automated import-plan and handoff payload verification. | Entry contract + smoke launch only. | No automated import plan payload assertions. | Medium | Add import plan fixture + handoff assertion lane. |
| Asset Pipeline Tool | Conversion/validation automation | Automated fixture conversion/validation assertions. | Boot/load smoke only. | Pipeline behavior is not covered beyond launch. | Medium | Add asset pipeline fixture test lane. |
| Palette Browser / Manager | Edit/persist automation | Automated palette create/edit/save/load cycle checks. | Entry contract + smoke launch only. | No persistence workflow automation yet. | Medium | Add palette lifecycle automation lane. |
| Parallax Scene Studio | Scene workflow automation | Automated scene open/edit/export checks. | Entry contract + smoke launch only. | No automated scene edit/export validation. | Medium | Add parallax scene fixture lane. |
| Performance Profiler | Data ingestion automation | Automated deterministic profile ingestion + render checks. | Boot/load smoke only. | No assertions for profile metric correctness. | Medium | Add profiler fixture ingestion lane. |
| Physics Sandbox | Simulation automation | Automated deterministic simulation scenario checks. | Boot/load smoke only. | No workflow-level simulation assertions. | Medium | Add fixed-step simulation test lane. |
| Replay Visualizer | Replay workflow automation | Automated replay load/seek/playback contract checks. | Boot/load smoke only. | Replay timeline correctness not automated. | Medium | Add replay fixture timeline lane. |
| Sprite Editor | Authoring automation | Automated frame edit + save/load round-trip checks. | Entry contract + smoke launch only. | No automated edit persistence assertions. | Medium | Add sprite authoring fixture lane. |
| State Inspector | Data/error-path automation | Automated valid/invalid snapshot rendering checks. | Boot/load smoke only. | Invalid payload handling not automation-backed. | Medium | Add state payload contract lane. |
| Tile Model Converter | Conversion automation | Automated source-to-output conversion fixture checks. | Boot/load smoke only. | Output conversion correctness not automated. | Medium | Add converter fixture assertion lane. |
| Tilemap Studio | Tilemap workflow automation | Automated open/edit/save/export checks. | Entry contract + smoke launch only. | Tilemap persistence/export not automated. | Medium | Add tilemap document workflow lane. |
| Tool Host | Tool dispatch automation | Automated host `?tool=<id>` dispatch contract checks. | Smoke launch only. | No dedicated host dispatch test. | High | Add focused Tool Host dispatch contract test. |
| Vector Asset Studio | Vector asset workflow automation | Automated vector asset open/edit/export checks. | Entry contract + smoke launch only. | No workflow-level vector asset assertions. | Medium | Add vector asset fixture lane. |
| Vector Map Editor | Geometry workflow automation | Automated geometry import/edit/export checks. | Entry contract + smoke launch only. | No workflow-level geometry assertions. | Medium | Add vector map fixture lane. |
| Tools Index / Registry validation surface | Validator reliability | Registry/index validators run cleanly against active contract. | Two legacy validators fail on stale assumptions. | Validator scripts need contract hardening. | High | Patch validator scripts for active-surface contract and optional-doc handling. |
