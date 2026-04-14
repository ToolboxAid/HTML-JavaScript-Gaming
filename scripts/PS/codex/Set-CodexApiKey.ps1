[CmdletBinding()]
param(
    [string]$ApiKey,
    [ValidateSet("Process", "User")]
    [string]$Scope = "User",
    [string]$EnvVarName = "OPENAI_API_KEY",
    [string]$StatePath
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
    $secureInput = Read-Host -Prompt "Enter OpenAI API key (input hidden)" -AsSecureString
    $ApiKey = ConvertTo-PlainText -SecureValue $secureInput
}

if (-not (Test-CodexApiKeyFormat -ApiKey $ApiKey)) {
    throw "API key format appears invalid. Expected a non-empty key that starts with 'sk-' and is at least 20 characters."
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
