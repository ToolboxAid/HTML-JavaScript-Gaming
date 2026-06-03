# PR_26126_082 Asset Manager V2 Manual Validation Notes

## Requested Validation

Command:

```text
npm run test:workspace-v2
```

Result: PASS, 10 Playwright tests passed.

## Covered Behaviors

- Tool mode launch: `tools/asset-manager-v2/index.html` loads with Asset Manager V2 title, tool nav visible, workspace nav hidden, and visible status/log output.
- Asset-only controls: only Image, Audio, and Font controls are present; SVG, data, and other kind controls are absent.
- Approved asset add: adding `image.arcade.ship` succeeds, updates the approved asset list, updates Output Summary, and writes an `OK Added ...` status line.
- Schema rejection: a payload containing `svg.arcade.logo` with `kind: "svg"` is rejected and writes a visible `FAIL Schema validation failed` status line.
- Workspace mode launch: `tools/workspace-v2/index.html` launches Asset Manager V2 with `launch=workspace`, `fromTool=workspace-v2`, and `hostContextId`.
- Workspace insertion: adding `audio.arcade.fire` and using Insert Assets writes only to `workspaceManifest.tools["asset-browser"].assets`.
- Mutation scope: Workspace insertion does not create `tools["asset-manager-v2"]`, `tools["workspace-v2"]`, or any tool-wide discovery payload.
- Tools index: Asset Manager V2 renders as a first-class active tool from the registry.
- Sample JSON: no sample JSON files were modified.

## Coverage

The final Playwright/V8 report is `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

Changed runtime JS coverage has no advisory low-coverage warnings in `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.
