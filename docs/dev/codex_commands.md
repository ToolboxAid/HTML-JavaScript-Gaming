# Codex Commands - PR 11.188

Model: GPT-5.4
Reasoning: high

Run one BUILD only:

```text
BUILD_PR_LEVEL_11_188_PALETTE_REVERSE_ENGINEER_AND_REBUILD
```

Use the repo instructions and this bundle as the source of truth.

Hard requirements:

- one PR purpose only
- no schemas
- no samples
- no games
- no old Workspace Manager fixes
- no legacy tool patches
- no `tools/shared/**` changes
- move `tools/Palette Browser/` to `tools/Palette Browser-v1/`
- create clean `tools/Palette Browser/`
- create `tools/common/toolLayout.css`
- create `tools/common/sessionContext.js`
- create `tools/common/toolContract.js`
- reverse engineer first and document findings
- no fallback/default data
- no `platformShell`
- no shared handoff
- no copied legacy implementation code
- visible tool name must not include `v2`

Validation required:

```powershell
node --check "tools/common/sessionContext.js"
node --check "tools/common/toolContract.js"
node --check "tools/Palette Browser/main.js"
```

Do not run full samples smoke unless required by a broad shared sample loader change. Record the skip/run decision and reason.

Return ZIP artifact at:

```text
<project folder>/tmp/PR_11_188_20260501_01.zip
```
