# PowerShell Script Structure

This repo uses a purpose-based PowerShell layout:

- `scripts/PS/`
  - general operator scripts that are not codex-only and not deployment-only
- `scripts/PS/codex/`
  - codex session/operator scripts
- `scripts/PS/deploy/`
  - deployment/staging scripts

## Current Canonical Scripts

General (`scripts/PS/`):
- `New-Game-from-Template.ps1`
- `Validate-ScriptStructure.ps1`

Codex (`scripts/PS/codex/`):
- `CodexOperatorState.ps1`
- `CodexPreprocessor.ps1`
- `Get-CodexOperatorState.ps1`
- `Set-CodexApiKey.ps1`
- `Switch-CodexPlanMode.ps1`
- `Validate-CodexApiKey.ps1`

Deploy (`scripts/PS/deploy/`):
- `WebsiteRepoDeploymentCommon.ps1`
- `Prep-WebsiteRepoDeployment.ps1`
- `Update-WebsiteRepoDeployment.ps1`
- `Clean-WebsiteRepoDeployment.ps1`

## Validation

Run:

```powershell
.\scripts\PS\Validate-ScriptStructure.ps1
```

Optional JSON output:

```powershell
.\scripts\PS\Validate-ScriptStructure.ps1 -Json
```
