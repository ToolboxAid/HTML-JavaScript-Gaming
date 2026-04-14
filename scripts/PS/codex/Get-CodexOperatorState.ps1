[CmdletBinding()]
param(
    [string]$StatePath,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "CodexOperatorState.ps1")

$resolvedStatePath = Get-CodexOperatorStatePath -StatePath $StatePath

if ($DryRun.IsPresent) {
    Write-Host "Dry-run only. No state read performed."
    Write-Host "Would read codex state from: $resolvedStatePath"
    exit 0
}

$state = Read-CodexOperatorState -StatePath $resolvedStatePath

$summary = [ordered]@{
    statePath = $resolvedStatePath
    planMode = $state.planMode
    planModeUpdatedUtc = $state.planModeUpdatedUtc
    apiKey = [ordered]@{
        configured = $state.apiKey.configured
        envVarName = $state.apiKey.envVarName
        scope = $state.apiKey.scope
        fingerprint = $state.apiKey.fingerprint
        updatedUtc = $state.apiKey.updatedUtc
    }
}

$summary | ConvertTo-Json -Depth 5
