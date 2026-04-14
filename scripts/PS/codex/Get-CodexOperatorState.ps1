[CmdletBinding()]
param(
    [string]$StatePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "CodexOperatorState.ps1")

$resolvedStatePath = Get-CodexOperatorStatePath -StatePath $StatePath
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
