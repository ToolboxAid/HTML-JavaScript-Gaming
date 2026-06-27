# Manual Validation Notes - PR_26179_OWNER_006-move-bootstrap-scripts

- No runtime UI was changed.
- No browser storage, API contract, database schema, or product behavior changed.
- Playwright browser execution was not run because this PR moves dev runner/config paths only; moved config discovery and structure audit passed.
- Local API startup was validated by importing the moved startup module and by checking `package.json` command routing.
- GitHub Actions platform-validation path was corrected from `node ./scripts/run-platform-validation-suite.mjs` to `node ./dev/scripts/run-platform-validation-suite.mjs`.
- Local platform validation completed 8/8 scenarios after the workflow path fix.
