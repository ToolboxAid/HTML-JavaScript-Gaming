[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "Low")]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("payg", "codex")]
    [string]$Mode,
    [string]$StatePath,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "CodexOperatorState.ps1")

$resolvedStatePath = Get-CodexOperatorStatePath -StatePath $StatePath
$state = Read-CodexOperatorState -StatePath $resolvedStatePath

if ($DryRun.IsPresent) {
    Write-Host "Dry-run only. No state file updates were made."
    Write-Host "Would set active plan mode to '$Mode' at '$resolvedStatePath'."
    exit 0
}

if (-not $PSCmdlet.ShouldProcess($resolvedStatePath, "Set active plan mode to '$Mode'")) {
    Write-Host "Plan mode switch cancelled."
    exit 0
}

$state.planMode = $Mode
$state.planModeUpdatedUtc = [DateTime]::UtcNow.ToString("o")

Write-CodexOperatorState -State $state -StatePath $resolvedStatePath

Write-Host "Active plan mode: $($state.planMode)"
Write-Host "State file: $resolvedStatePath"
