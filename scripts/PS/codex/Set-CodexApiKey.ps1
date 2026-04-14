[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "Medium")]
param(
    [string]$ApiKey,
    [ValidateSet("Process", "User")]
    [string]$Scope = "User",
    [ValidatePattern("^[A-Za-z_][A-Za-z0-9_]*$")]
    [string]$EnvVarName = "OPENAI_API_KEY",
    [string]$StatePath,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "CodexOperatorState.ps1")

function ConvertTo-PlainText {
    param(
        [Parameter(Mandatory = $true)]
        [System.Security.SecureString]$SecureValue
    )

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    if ($DryRun.IsPresent) {
        throw "Dry-run mode requires -ApiKey so the script can validate format and report the planned update."
    }
    $secureInput = Read-Host -Prompt "Enter OpenAI API key (input hidden)" -AsSecureString
    $ApiKey = ConvertTo-PlainText -SecureValue $secureInput
}

if (-not (Test-CodexApiKeyFormat -ApiKey $ApiKey)) {
    throw "API key format appears invalid. Expected a non-empty key that starts with 'sk-' and is at least 20 characters."
}

if ($DryRun.IsPresent) {
    $fingerprint = Get-CodexApiKeyFingerprint -ApiKey $ApiKey
    Write-Host "Dry-run only. No environment or state updates were made."
    Write-Host "Would set $EnvVarName in $Scope scope."
    Write-Host "Would record fingerprint: $fingerprint"
    exit 0
}

if (-not $PSCmdlet.ShouldProcess($EnvVarName, "Configure API key in $Scope scope and update codex state metadata")) {
    Write-Host "API key update cancelled."
    exit 0
}

if ($Scope -eq "Process") {
    Set-Item -Path "Env:$EnvVarName" -Value $ApiKey
}
else {
    [Environment]::SetEnvironmentVariable($EnvVarName, $ApiKey, "User")
    Set-Item -Path "Env:$EnvVarName" -Value $ApiKey
}

$resolvedStatePath = Get-CodexOperatorStatePath -StatePath $StatePath
$state = Read-CodexOperatorState -StatePath $resolvedStatePath

$state.apiKey.configured = $true
$state.apiKey.envVarName = $EnvVarName
$state.apiKey.scope = $Scope
$state.apiKey.fingerprint = Get-CodexApiKeyFingerprint -ApiKey $ApiKey
$state.apiKey.updatedUtc = [DateTime]::UtcNow.ToString("o")

Write-CodexOperatorState -State $state -StatePath $resolvedStatePath

Write-Host "API key configured for $EnvVarName ($Scope scope)."
Write-Host "Stored metadata fingerprint: $($state.apiKey.fingerprint)"
Write-Host "State file: $resolvedStatePath"
