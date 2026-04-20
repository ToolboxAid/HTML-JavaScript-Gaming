MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_INLINE_CLEANUP_REUSE_HIGHER_LEVEL_CSS

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_INLINE_CLEANUP_REUSE_HIGHER_LEVEL_CSS.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only if this PR touches an existing STYLE item execution-backed
- remove all targeted inline <style> blocks
- if the inline styles match or are close to a higher-level existing CSS path, reuse it
- create new shared CSS only when necessary
- do NOT introduce inline style=""
- do NOT introduce JS-generated styling
- preserve behavior/layout as closely as possible

Targets:
- games/Breakout/index.html
- samples/phase-13/1316/index.html
- samples/phase-13/1316/server/networkSampleADashboardServer.mjs
- samples/phase-13/1317/index.html
- samples/phase-13/1318/index.html
- samples/phase-13/1319/index.html
- samples/phase-13/1319/server/realNetworkDashboard.mjs
- samples/shared/runtimePreviewCapture.html
- tests/index.html
- tests/testRunner.html
- tools/preview/preview_svg_generator.html
- tools/shared/preview/generate-list-previews.html
- tools/shared/preview/generate-previews.html

Required work:
1. Audit each inline <style> block.
2. Reuse higher-level existing CSS when the rules already match or are close enough.
3. Create new shared CSS only if reuse would be incorrect.
4. Remove the inline <style> blocks.
5. Add/adjust stylesheet links accordingly.
6. Keep the change narrow, testable, and free of inline/embedded styling in the targeted files.
