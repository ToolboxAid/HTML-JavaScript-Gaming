# BUILD_PR_11_21_WORKSPACE_MANAGER_TOOL_PRESENT_DETECTION_FIX

## Required Codex Work

### 1. Locate Workspace Manager presence logic
Find the code that decides whether a workspace tool is:
- present
- available
- enabled
- missing
- invalid

Expected areas may include:
- Workspace manager/controller files
- tool registry integration
- platform shell workspace host
- manifest validation helpers

### 2. Use strict manifest.tools as source
Presence detection must use:
`manifest.tools`

Algorithm:
1. read `Object.keys(manifest.tools || {})`
2. normalize only documented special cases
3. match keys to registry-supported workspace tools
4. validate payload against tool schema
5. mark valid matches as present
6. report invalid/missing separately

### 3. Palette special case
If the schema has:
`tools.palette-browser`

Then:
- treat key `palette` as present
- map it to the Palette Browser tool UI if needed
- do not let this special case suppress other tools
- do not require `palette-browser` duplicate unless schema says so

### 4. Stop old presence assumptions
Do not derive presence from:
- top-level `palettes`
- `games[].tools`
- `activeWorkspaceTools`
- old `config`
- old top-level `payload`
- sample wrapper schemas

Those may only be legacy compatibility if explicitly separated from the 1902 path.

### 5. Validation instrumentation
Add validation/report evidence showing:
- raw `manifest.tools` keys loaded
- normalized keys
- registry matched keys
- schema-valid keys
- keys shown in Workspace Manager
- any missing/invalid keys with reason

### 6. Validation report
Create:
docs/dev/reports/PR_11_21_WORKSPACE_MANAGER_TOOL_PRESENT_DETECTION_FIX_report.md

Report must include:
- files changed
- old presence check
- new presence check
- sample 1902 raw tool keys
- sample 1902 present tool keys
- sample 1902 invalid/rejected keys, if any
- proof Workspace Manager shows more than Palette
- confirmation no schema loosening
- confirmation no other samples changed
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- No schema loosening.
- No broad Workspace rewrite.
- No unrelated UI polish.
- No fallback/default/hidden data.
