# Codex Command

MODEL: GPT-5.4-codex  
REASONING: high

## COMMAND
Execute `BUILD_PR_SAMPLES_RUNTIME_PREVIEW_SVG_CAPTURE` exactly as written.

## EXECUTION ENVIRONMENT (MANDATORY)
- Target platform: Windows
- Prefer Node.js or vanilla JS for any scripting or generation support
- DO NOT run `npm install`
- DO NOT create `package.json`
- DO NOT create `package-lock.json`
- DO NOT create or populate `node_modules/`
- Do not depend on external screenshot tools or browser extensions

## HARD CONSTRAINTS
- Do not modify gameplay logic except for minimal non-behavioral hooks strictly required for automated preview capture
- Do not modify engine core unless absolutely required for capture orchestration
- Do not change sample page layout
- Do not change tags, titles, related samples, or engine-classes-used presentation
- Do not modify `samples/index.html` except if strictly required to consume existing preview asset paths already used by the system
- Do not modify `docs/dev/start_of_day/chatGPT/`
- Do not modify `docs/dev/start_of_day/codex/`
- Do not perform more work on `1316`, `1317`, or `1318`; preserve them exactly as they are now

## RUNTIME CAPTURE REQUIREMENT
For each targeted sample:
1. Load the actual runnable sample page
2. Let the game/sample run for 3 seconds
3. Capture the live canvas appearance at 3000 ms
4. Generate/update the preview SVG asset from that runtime-derived canvas state

## ZIP OUTPUT REQUIREMENT
Must produce:
`<project folder>/tmp/BUILD_PR_SAMPLES_RUNTIME_PREVIEW_SVG_CAPTURE.zip`

Task is not complete until that ZIP exists at the exact requested path.
