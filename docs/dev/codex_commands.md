MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply PR 11.46.

Continue targeted sample JSON cleanup from PR 11.41, PR 11.43, and PR 11.44.

Use the current audit output from:
docs/dev/reports/sample_json_js_reference_audit.csv
and/or the console output from scripts/PS/audit-sample-json-js-references.ps1.

Focus ONLY on a small high-confidence batch of non-palette, non-tile-map JSON payloads.

Preferred candidates:
1. samples/phase-02/0221/sample.0221.3d-json-payload-normalizer.json
2. samples/phase-05/0510/sample.0510.asset-pipeline-tool.json
3. samples/phase-05/0512/sample.0512.performance-profiler.json
4. samples/phase-07/0708/sample.0708.replay-visualizer.json

For each selected JSON:
- inspect the sample executable JS under the same sample subtree
- inspect the related tool behavior if needed
- decide:
  KEEP + WIRE
  MOVE / REHOME
  DELETE
  CREATE / UPDATE CORRECT SAMPLE
  DEFER
- apply only safe, obvious changes

Do NOT:
- touch palette JSON files
- touch tile-map-editor-document JSON files
- touch sample 1902
- force JSON into a mismatched sample
- add hidden/default fallback data
- run full samples smoke by default
- undo SVG Asset Studio rename
- rename tools
- change unrelated logic
- touch start_of_day folders

Testing policy:
Full samples smoke takes about 20 minutes.
Skip it unless this PR changes shared sample launch infrastructure.

Run targeted validation only:
- syntax checks for changed JS files
- the PowerShell audit script
- targeted sample/tool tests for changed samples only, if available

Reports:
Write:
docs/dev/reports/PR_11_46_cleanup_batch_3.md
docs/dev/reports/PR_11_46_validation.txt

Cleanup report must include:
- selected JSON files
- classification/action for each
- files changed
- coverage preserved statement
- deferred items and reasons
- note that palette/tile-map/1902 were intentionally excluded

Validation report must include:
- targeted tests run
- full samples smoke skipped/run
- reason for skip/run
- result
