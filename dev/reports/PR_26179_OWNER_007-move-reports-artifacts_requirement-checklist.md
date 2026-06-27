# PR_26179_OWNER_007-move-reports-artifacts Requirement Checklist

| Status | Item | Notes |
| --- | --- | --- |
| PASS | Move tmp/ to dev/workspace/artifacts/tmp/ | Codex ZIP and generated temporary artifact expectations now point to dev/workspace/artifacts/tmp/. Root tmp/ remains ignored as legacy local scratch only. |
| PASS | Move generated ZIP/report/artifact expectations to dev/workspace/artifacts/ | Non-report artifacts are governed under dev/workspace/artifacts/; ZIPs under dev/workspace/artifacts/tmp/. |
| PASS | Use flat dev/reports/ with team/runner in report filenames rather than nested team folders | Tracked report tree is flat: 0 nested tracked paths. |
| PASS | Update Codex deliverable paths and report expectations | Project Instructions, PR template, README, dev scripts, and report contract tests now use dev/reports/ and dev/workspace/artifacts/tmp/. |
| PASS | No runtime/business logic moved into dev/ | No production/runtime scope changes detected. |
| PASS | Do not modify start_of_day folders | No start_of_day changes detected. |

Result: PASS
