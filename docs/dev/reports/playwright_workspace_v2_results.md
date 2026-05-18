# npm run test:workspace-v2

Exit code: 0

```text

> html-javascript-gaming@1.0.0 test:workspace-v2
> playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list


Running 54 tests using 1 worker

  ok  1 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:1155:3 › Workspace Manager V2 bootstrap › registers Workspace Manager V2 from the tools index (1.6s)
  ok  2 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:1302:3 › Workspace Manager V2 bootstrap › launches World Vector Studio V2 and Object Vector Studio V2 copied tool shells (2.6s)
  ok  3 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:1353:3 › Workspace Manager V2 bootstrap › shows Object Vector Studio V2 layout shell and schema-only palette gate (56.6s)
  ok  4 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:3699:3 › Workspace Manager V2 bootstrap › creates Object Vector Studio V2 square shapes with one size control (2.6s)
  ok  5 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:3799:3 › Workspace Manager V2 bootstrap › creates Object Vector Studio V2 shapes with canvas drawing and snap modes (22.3s)
  ok  6 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:4379:3 › Workspace Manager V2 bootstrap › maps Object Vector Studio V2 preview coordinates directly to visible grid lines (7.4s)
  ok  7 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:4771:3 › Workspace Manager V2 bootstrap › compacts Object Vector Studio V2 geometry layouts and selected palette state (5.1s)
  ok  8 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:4998:3 › Workspace Manager V2 bootstrap › edits Object Vector Studio V2 preview shapes with mouse actions and tile delete controls (10.1s)
  ok  9 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:5251:3 › Workspace Manager V2 bootstrap › aligns Object Vector Studio V2 selection bounds to transformed preview geometry (2.3s)
  ok 10 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:5415:3 › Workspace Manager V2 bootstrap › applies Object Vector Studio V2 Resize Geometry across supported shape tools (6.0s)
  ok 11 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:5508:3 › Workspace Manager V2 bootstrap › expands Object Vector Studio V2 asset authoring controls (8.2s)
  ok 12 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:5769:3 › Workspace Manager V2 bootstrap › supports Object Vector Studio V2 animation states and frame timeline foundation (10.5s)
  ok 13 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:6043:3 › Workspace Manager V2 bootstrap › cleans Object Vector Studio V2 single-member groups and adds selected object states (6.8s)
  ok 14 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:6360:3 › Workspace Manager V2 bootstrap › supports Object Vector Studio V2 asset library inheritance foundation (3.3s)
  ok 15 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:6541:3 › Workspace Manager V2 bootstrap › resolves asset-manager-v2 audio catalog paths and plays Asteroids sounds (1.4s)
  ok 16 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:6702:3 › Workspace Manager V2 bootstrap › fits the game canvas inside the fullscreen play area and restores layout on exit (1.9s)
  ok 17 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:6870:3 › Workspace Manager V2 bootstrap › loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering (1.8s)
  ok 18 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:6994:3 › Workspace Manager V2 bootstrap › uses First-Class Tool V2 theme contract (1.2s)
  ok 19 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7079:3 › Workspace Manager V2 bootstrap › shows safe empty Text to Speech V2 state when no JSON source is provided (2.0s)
  ok 20 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7191:3 › Workspace Manager V2 bootstrap › does not redirect legacy Text to Speech V2 path, sample, or schema references (939ms)
  ok 21 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7216:3 › Workspace Manager V2 bootstrap › loads sample 1903 JSON into Text to Speech V2 through sample wiring (1.4s)
  ok 22 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7240:3 › Workspace Manager V2 bootstrap › loads Text to Speech V2 from URL JSON with full options, schema-complete queue, and speech actions (8.9s)
  ok 23 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7817:3 › Workspace Manager V2 bootstrap › deletes the last named sentence into a safe empty runtime state (2.0s)
  ok 24 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7860:3 › Workspace Manager V2 bootstrap › imports, copies, and exports standalone Text to Speech V2 root-array JSON (1.9s)
  ok 25 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:7967:3 › Workspace Manager V2 bootstrap › populates text2speech-V2 voice dropdown when SpeechSynthesis voices arrive after load (1.3s)
  ok 26 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8000:3 › Workspace Manager V2 bootstrap › filters text2speech-V2 voices by Any, Male, Female, and Neutral gender helpers (1.7s)
  ok 27 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8034:3 › Workspace Manager V2 bootstrap › shapes text2speech-V2 Voice Age without filtering selected voices (1.3s)
  ok 28 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8060:3 › Workspace Manager V2 bootstrap › rejects Text to Speech V2 workspace payload drift before render or save (1.7s)
  ok 29 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8144:3 › Workspace Manager V2 bootstrap › validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema (2.1s)
  ok 30 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8250:3 › Workspace Manager V2 bootstrap › launches Storage Inspector V2 with V2 labels, accordions, theme, and delete controls (9.3s)
  ok 31 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8599:3 › Workspace Manager V2 bootstrap › shows normalized workspace tool sessions as JSON, Data, and Dirty views (4.2s)
  ok 32 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8850:3 › Workspace Manager V2 bootstrap › starts with no active game even when stale session hydration exists (1.2s)
  ok 33 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:8899:3 › Workspace Manager V2 bootstrap › discovers Active Game options from selected repo manifests (2.4s)
  ok 34 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:9052:3 › Workspace Manager V2 bootstrap › uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles (34.6s)
  ok 35 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:9924:3 › Workspace Manager V2 bootstrap › enables Text to Speech V2 after repo and game selection and preserves workspace return nav (5.2s)
  ok 36 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:9966:3 › Workspace Manager V2 bootstrap › shows Preview Generator tile status from assets/images/preview.svg existence (2.7s)
  ok 37 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10000:3 › Workspace Manager V2 bootstrap › saves empty Text to Speech V2 arrays through workspace return and manifest write-back (5.0s)
  ok 38 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10128:3 › Workspace Manager V2 bootstrap › keeps Preview Generator V2 repo writer after Asset Manager V2 deletes the preview asset entry (8.6s)
  ok 39 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10200:3 › Workspace Manager V2 bootstrap › fails Preview Generator V2 without OK WRITE when live handle read-back verification fails (7.3s)
  ok 40 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10244:3 › Workspace Manager V2 bootstrap › tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes (15.3s)
  ok 41 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10541:3 › Workspace Manager V2 bootstrap › syncs Workspace Manager V2 dirty lifecycle buttons and closes clean toolState data (3.4s)
  ok 42 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10645:3 › Workspace Manager V2 bootstrap › restores sessionStorage toolState read-only until repo folder handle rebinds save source (4.1s)
  ok 43 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10753:3 › Workspace Manager V2 bootstrap › rebinds restored session Save to the discovered game manifest source (2.5s)
  ok 44 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10815:3 › Workspace Manager V2 bootstrap › logs recovery action when restored Save cannot bind to a game manifest source (1.9s)
  ok 45 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10856:3 › Workspace Manager V2 bootstrap › warns before Cancel clears dirty Workspace Manager V2 toolState data (2.4s)
  ok 46 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10911:3 › Workspace Manager V2 bootstrap › blocks Workspace Manager V2 return restore when repo session reference is missing or invalid (2.2s)
  ok 47 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:10961:3 › Workspace Manager V2 bootstrap › opens Preview Generator V2 workspace launch with actionable missing repo session status (1.7s)
  ok 48 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11002:3 › Workspace Manager V2 bootstrap › keeps Preview Generator V2 disabled for invalid workspace repo session state (1.6s)
  ok 49 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11062:3 › Workspace Manager V2 bootstrap › logs actionable Preview Generator V2 output path resolution failures (2.1s)
  ok 50 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11104:3 › Workspace Manager V2 bootstrap › loads Gravity Well and Pong manifests as current Workspace Manager V2 manifests (10.8s)
  ok 51 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11256:3 › Workspace Manager V2 bootstrap › blocks Workspace Manager V2 Save when the toolState file fails schema validation (1.8s)
  ok 52 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11299:3 › Workspace Manager V2 bootstrap › warns instead of injecting hardcoded Asteroids assets when manifest assets are empty (1.8s)
  ok 53 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11335:3 › Workspace Manager V2 bootstrap › owns temporary UAT manifest seeding and launches Asset Manager V2 through session context (2.2s)
  ok 54 [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs:11391:3 › Workspace Manager V2 bootstrap › keeps direct Asset Manager V2 workspace prod launch blocked (1.1s)

  Slow test file: [playwright] › tests\playwright\tools\WorkspaceManagerV2.spec.mjs (5.2m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  54 passed (5.8m)
```
