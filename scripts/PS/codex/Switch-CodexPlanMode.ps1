[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("payg", "codex")]
    [string]$Mode,
    [string]$StatePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "CodexOperatorState.ps1")

$resolvedStatePath = Get-CodexOperatorStatePath -StatePath $StatePath
$state = Read-CodexOperatorState -StatePath $resolvedStatePath

$state.planMode = $Mode
$state.planModeUpdatedUtc = [DateTime]::UtcNow.ToString("o")

Write-CodexOperatorState -State $state -StatePath $resolvedStatePath

Write-Host "Active plan mode: $($state.planMode)"
Write-Host "State file: $resolvedStatePath"
