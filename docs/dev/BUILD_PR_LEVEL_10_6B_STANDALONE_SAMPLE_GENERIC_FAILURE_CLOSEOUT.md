# BUILD_PR: LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT

## One-pass Codex build instruction
Implement the smallest valid changes needed to close remaining generic standalone sample/tool data-flow failures.

Use the existing failing report as the source of truth:

```text
docs/dev/reports/level_10_6_standalone_tool_data_flow_report.md
```

Focus only on failures where a sample launches but the tool does not receive or bind the payload correctly.

## Implementation boundaries
Codex may edit only files needed for standalone sample contract stability, typically:

- affected `samples/phase-*/*` sample files
- affected `tools/*` tool entrypoints or adapters
- affected manifest/contract files already used by these samples
- the standalone data-flow test only if it currently reports a false generic failure without weakening coverage
- docs/dev reports for the new result

Codex must not implement unrelated features.

## Contract checks per tool
For every changed failing area, verify:

1. Sample declares explicit payload/manifest input.
2. Schema or normalized contract accepts the payload shape.
3. Tool receives the payload from the standalone launch path.
4. Tool renders safe empty state only when the input is truly absent.
5. Tool does not auto-load hidden defaults, demo assets, or hardcoded paths.
6. Test report captures the corrected behavior.

## Required validation commands
Run these from repo root:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

## Required output files
Update or create:

```text
docs/dev/reports/level_10_6b_standalone_generic_failure_closeout_report.md
docs/dev/reports/level_10_6b_tool_contract_matrix.md
```

The closeout report must include:

- before generic failure count
- after generic failure count
- list of tools fixed
- list of tools still failing, if any
- exact validation commands run
- whether game launch smoke still passes

## Done criteria
- `npm run test:launch-smoke:games` passes.
- `npm run test:sample-standalone:data-flow` passes or materially reduces generic failures with a precise remaining list.
- No silent fallback data or hardcoded asset path was added.
- Roadmap status is advanced only through real validation-backed progress.
