[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$ValidateAssetStructure
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RepoRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
}

function New-ValidationResult {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Check,
        [Parameter(Mandatory = $true)]
        [bool]$Passed,
        [Parameter(Mandatory = $true)]
        [string]$Details,
        [object]$Data
    )

    return [pscustomobject]@{
        check = $Check
        passed = $Passed
        details = $Details
        data = $Data
    }
}

function Test-RequiredFolders {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    $required = @(
        "scripts\PS",
        "scripts\PS\codex",
        "scripts\PS\deploy",
        "scripts\PS\validate"
    )

    $missing = @()
    foreach ($relativePath in $required) {
        $fullPath = Join-Path $RepoRoot $relativePath
        if (-not (Test-Path -LiteralPath $fullPath)) {
            $missing += $relativePath
        }
    }

    if ($missing.Count -eq 0) {
        return New-ValidationResult -Check "requiredFolders" -Passed $true -Details "All required folders are present." -Data ([pscustomobject]@{
                required = $required
                missing = @()
            })
    }

    return New-ValidationResult -Check "requiredFolders" -Passed $false -Details "Missing required folders: $($missing -join ', ')" -Data ([pscustomobject]@{
            required = $required
            missing = $missing
        })
}

function Test-ScriptStructureContract {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ValidatorPath
    )

    if (-not (Test-Path -LiteralPath $ValidatorPath)) {
        return New-ValidationResult -Check "scriptStructure" -Passed $false -Details "Missing validation entrypoint: $ValidatorPath" -Data $null
    }

    $global:LASTEXITCODE = 0
    $raw = & $ValidatorPath -Json
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }

    $jsonText = ($raw | Out-String).Trim()
    if ([string]::IsNullOrWhiteSpace($jsonText)) {
        return New-ValidationResult -Check "scriptStructure" -Passed $false -Details "Validate-ScriptStructure produced no JSON output." -Data $null
    }

    $parsed = $null
    try {
        $parsed = $jsonText | ConvertFrom-Json
    }
    catch {
        return New-ValidationResult -Check "scriptStructure" -Passed $false -Details "Validate-ScriptStructure JSON parsing failed." -Data ([pscustomobject]@{
                exitCode = $exitCode
                raw = $jsonText
            })
    }

    $passed = $exitCode -eq 0 -and $parsed.valid -eq $true
    $issueCount = if ($null -ne $parsed.issues) { @($parsed.issues).Count } else { 0 }
    $details = if ($passed) {
        "Script structure validation passed."
    }
    else {
        "Script structure validation failed with $issueCount issue(s)."
    }

    return New-ValidationResult -Check "scriptStructure" -Passed $passed -Details $details -Data ([pscustomobject]@{
            exitCode = $exitCode
            issueCount = $issueCount
            issues = $parsed.issues
        })
}

function Test-OptionalAssetStructure {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    $gamesRoot = Join-Path $RepoRoot "games"
    if (-not (Test-Path -LiteralPath $gamesRoot)) {
        return New-ValidationResult -Check "assetStructure" -Passed $false -Details "Missing games root: games/" -Data $null
    }

    $domains = @("sprites", "tilemaps", "parallax", "vectors")
    $issues = New-Object System.Collections.Generic.List[string]
    $checkedGames = New-Object System.Collections.Generic.List[string]
    $checkedDomains = 0

    foreach ($gameDir in (Get-ChildItem -LiteralPath $gamesRoot -Directory -ErrorAction SilentlyContinue)) {
        $assetsRoot = Join-Path $gameDir.FullName "assets"
        if (-not (Test-Path -LiteralPath $assetsRoot)) {
            continue
        }

        $checkedGames.Add($gameDir.Name)
        foreach ($domain in $domains) {
            $domainRoot = Join-Path $assetsRoot $domain
            if (-not (Test-Path -LiteralPath $domainRoot -PathType Container)) {
                continue
            }

            $checkedDomains += 1
            $dataRoot = Join-Path $domainRoot "data"
            if (-not (Test-Path -LiteralPath $dataRoot -PathType Container)) {
                $issues.Add("Missing data folder for $($gameDir.Name)/assets/$domain (expected: games/$($gameDir.Name)/assets/$domain/data)")
            }
        }
    }

    $passed = $issues.Count -eq 0
    $details = if ($passed) {
        if ($checkedDomains -eq 0) {
            "Asset structure check passed. No active domain folders were found to validate."
        }
        else {
            "Asset structure check passed for $checkedDomains domain folder(s)."
        }
    }
    else {
        "Asset structure check failed with $($issues.Count) issue(s)."
    }

    return New-ValidationResult -Check "assetStructure" -Passed $passed -Details $details -Data ([pscustomobject]@{
            checkedGames = @($checkedGames)
            checkedDomainCount = $checkedDomains
            issues = @($issues)
        })
}

$validatorPath = Join-Path $PSScriptRoot "Validate-ScriptStructure.ps1"
$repoRoot = Get-RepoRoot

try {
    $results = New-Object System.Collections.ArrayList

    [void]$results.Add((Test-RequiredFolders -RepoRoot $repoRoot))
    [void]$results.Add((Test-ScriptStructureContract -ValidatorPath $validatorPath))

    if ($ValidateAssetStructure.IsPresent) {
        [void]$results.Add((Test-OptionalAssetStructure -RepoRoot $repoRoot))
    }

    $failed = @($results | Where-Object { -not $_.passed })
    $summary = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    $output = [pscustomobject]@{
        schema = "html-js-gaming.validate-all"
        version = 1
        summary = $summary
        checkCount = @($results).Count
        failedCount = $failed.Count
        validateAssetStructure = $ValidateAssetStructure.IsPresent
        results = @($results)
    }

    if ($Json.IsPresent) {
        $output | ConvertTo-Json -Depth 30
    }
    else {
        foreach ($result in $results) {
            $status = if ($result.passed) { "PASS" } else { "FAIL" }
            Write-Host "[$status] $($result.check): $($result.details)"
            $issues = @()
            if ($null -ne $result.data -and ($result.data.PSObject.Properties.Name -contains "issues")) {
                $issues = @($result.data.issues)
            }
            if (-not $result.passed -and $issues.Count -gt 0) {
                foreach ($issue in $issues) {
                    Write-Host " - $issue"
                }
            }
        }
        Write-Host "Validate-All summary: $summary"
    }

    if ($failed.Count -gt 0) {
        exit 1
    }

    exit 0
}
catch {
    Write-Host "Validate-All summary: FAIL"
    Write-Host "Reason: $($_.Exception.Message)"
    exit 1
}
