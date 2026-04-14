Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-CodexRepoRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
}

function Get-CodexOperatorStatePath {
    param(
        [string]$StatePath
    )

    if (-not [string]::IsNullOrWhiteSpace($StatePath)) {
        return [System.IO.Path]::GetFullPath($StatePath)
    }

    $repoRoot = Get-CodexRepoRoot
    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot ".codex\local\codex-operator-state.json"))
}

function New-CodexOperatorState {
    return [ordered]@{
        schemaVersion = 1
        planMode = "payg"
        planModeUpdatedUtc = $null
        apiKey = [ordered]@{
            configured = $false
            envVarName = "OPENAI_API_KEY"
            scope = "User"
            fingerprint = $null
            updatedUtc = $null
        }
    }
}

function Read-CodexOperatorState {
    param(
        [Parameter(Mandatory = $true)]
        [string]$StatePath
    )

    if (-not (Test-Path -LiteralPath $StatePath)) {
        return New-CodexOperatorState
    }

    $raw = Get-Content -LiteralPath $StatePath -Raw -Encoding UTF8
    if ([string]::IsNullOrWhiteSpace($raw)) {
        return New-CodexOperatorState
    }

    $parsed = $raw | ConvertFrom-Json
    $state = New-CodexOperatorState

    if ($null -ne $parsed.schemaVersion) {
        $state.schemaVersion = [int]$parsed.schemaVersion
    }

    if (-not [string]::IsNullOrWhiteSpace([string]$parsed.planMode)) {
        $state.planMode = [string]$parsed.planMode
    }

    if (-not [string]::IsNullOrWhiteSpace([string]$parsed.planModeUpdatedUtc)) {
        $state.planModeUpdatedUtc = [string]$parsed.planModeUpdatedUtc
    }

    if ($null -ne $parsed.apiKey) {
        if ($null -ne $parsed.apiKey.configured) {
            $state.apiKey.configured = [bool]$parsed.apiKey.configured
        }
        if (-not [string]::IsNullOrWhiteSpace([string]$parsed.apiKey.envVarName)) {
            $state.apiKey.envVarName = [string]$parsed.apiKey.envVarName
        }
        if (-not [string]::IsNullOrWhiteSpace([string]$parsed.apiKey.scope)) {
            $state.apiKey.scope = [string]$parsed.apiKey.scope
        }
        if (-not [string]::IsNullOrWhiteSpace([string]$parsed.apiKey.fingerprint)) {
            $state.apiKey.fingerprint = [string]$parsed.apiKey.fingerprint
        }
        if (-not [string]::IsNullOrWhiteSpace([string]$parsed.apiKey.updatedUtc)) {
            $state.apiKey.updatedUtc = [string]$parsed.apiKey.updatedUtc
        }
    }

    return $state
}

function Write-CodexOperatorState {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$State,
        [Parameter(Mandatory = $true)]
        [string]$StatePath
    )

    $stateDirectory = Split-Path -Path $StatePath -Parent
    if (-not (Test-Path -LiteralPath $stateDirectory)) {
        New-Item -ItemType Directory -Path $stateDirectory -Force | Out-Null
    }

    $json = $State | ConvertTo-Json -Depth 8
    [System.IO.File]::WriteAllText($StatePath, $json + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
}

function Test-CodexApiKeyFormat {
    param(
        [string]$ApiKey
    )

    if ([string]::IsNullOrWhiteSpace($ApiKey)) {
        return $false
    }

    if (-not $ApiKey.StartsWith("sk-")) {
        return $false
    }

    if ($ApiKey.Length -lt 20) {
        return $false
    }

    return $true
}

function Get-CodexApiKeyFingerprint {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ApiKey
    )

    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($ApiKey)
        $hashBytes = $sha.ComputeHash($bytes)
        $hashText = [System.BitConverter]::ToString($hashBytes).Replace("-", "").ToLowerInvariant()
        return "sha256:$($hashText.Substring(0, 12))"
    }
    finally {
        $sha.Dispose()
    }
}

function Resolve-CodexApiKeyFromEnvironment {
    param(
        [Parameter(Mandatory = $true)]
        [string]$EnvVarName
    )

    $processValue = [Environment]::GetEnvironmentVariable($EnvVarName, "Process")
    if (-not [string]::IsNullOrWhiteSpace($processValue)) {
        return [ordered]@{
            value = $processValue
            scope = "Process"
        }
    }

    $userValue = [Environment]::GetEnvironmentVariable($EnvVarName, "User")
    if (-not [string]::IsNullOrWhiteSpace($userValue)) {
        return [ordered]@{
            value = $userValue
            scope = "User"
        }
    }

    return $null
}
