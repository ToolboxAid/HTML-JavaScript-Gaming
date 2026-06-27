# PR_26128_011 Playwright Preview Generator Session Repo Load

## Command
`npm run test:workspace-v2`

## Result
PASS: 13/13 tests passed.

## Targeted Coverage
- Workspace Manager V2 repo selection writes `workspace.repo.reference`.
- Preview Generator V2 workspace launch reads `workspace.repo.reference`.
- Preview Generator V2 workspace launch reads `workspace.tools.preview-generator-v2.state`.
- Preview Generator V2 hides independent repo selection during workspace launch.
- Generate Image is enabled after valid workspace manifest, repo reference, tool state, and preview source hydration.
- Generate Image remains disabled when `workspace.repo.reference` is missing.
- Generate Image remains disabled when repo session data is invalid.
- Asteroids workspace launch generates a real SVG preview and records it through the session-backed repo handle.
- Gravity Well and Pong workspace launches also resolve repo context from session storage and enable Generate Image.

## Skipped
Full samples smoke test was skipped as requested because this PR changes Workspace Manager V2 to Preview Generator V2 session hydration. The targeted workspace suite covers the affected cross-tool launch path without exercising unrelated samples.
