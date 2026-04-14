[CmdletBinding()]
param(
    [string]$EnvVarName = "OPENAI_API_KEY",
    [string]$StatePath,
    [switch]$RequireStateRecord
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "CodexOperatorState.ps1")

$resolvedStatePath = Get-CodexOperatorStatePath -StatePath $StatePath
$stateExists = Test-Path -LiteralPath $resolvedStatePath

if ($RequireStateRecord.IsPresent -and -not $stateExists) {
    throw "Required state file not found: $resolvedStatePath"
}

$state = Read-CodexOperatorState -StatePath $resolvedStatePath

if ($state.apiKey.configured -and $state.apiKey.envVarName -ne $EnvVarName) {
    Write-Warning "State file tracks env var '$($state.apiKey.envVarName)' but validation is checking '$EnvVarName'."
}

$resolvedKey = Resolve-CodexApiKeyFromEnvironment -EnvVarName $EnvVarName
if ($null -eq $resolvedKey) {
    throw "No API key found in process/user environment for '$EnvVarName'. Run Set-CodexApiKey.ps1 first."
}

if (-not (Test-CodexApiKeyFormat -ApiKey $resolvedKey.value)) {
    throw "API key for '$EnvVarName' failed format readiness checks."
}

$fingerprint = Get-CodexApiKeyFingerprint -ApiKey $resolvedKey.value
if ($state.apiKey.configured -and -not [string]::IsNullOrWhiteSpace([string]$state.apiKey.fingerprint)) {
    if ($state.apiKey.fingerprint -ne $fingerprint) {
        Write-Warning "Fingerprint mismatch between state metadata and current environment value."
    }
}

Write-Host "API key validation passed for '$EnvVarName'."
Write-Host "Resolved key source scope: $($resolvedKey.scope)"
Write-Host "Current key fingerprint: $fingerprint"
if ($stateExists) {
    Write-Host "State file: $resolvedStatePath"
}

exit 0
