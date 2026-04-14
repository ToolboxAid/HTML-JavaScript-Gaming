[CmdletBinding()]
param(
    [string]$StagingRoot,
    [string[]]$IncludePaths,
    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "WebsiteRepoDeploymentCommon.ps1")

$repoRoot = Get-CodexRepoRoot
$paths = Get-WebsiteDeploymentPaths -StagingRoot $StagingRoot
$normalizedIncludePaths = Normalize-IncludePaths -IncludePaths $IncludePaths
if ($normalizedIncludePaths.Count -eq 0) {
    $normalizedIncludePaths = Get-DefaultWebsiteIncludePaths
}

$missing = New-Object System.Collections.Generic.List[string]
foreach ($entry in $normalizedIncludePaths) {
    $fullPath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $entry))
    if (-not (Test-PathWithinRoot -Path $fullPath -RootPath $repoRoot)) {
        throw "Include path escapes repo root: $entry"
    }
    if (-not (Test-Path -LiteralPath $fullPath)) {
        $missing.Add($entry)
    }
}
if ($missing.Count -gt 0) {
    throw "Prep validation failed. Missing include path(s): $($missing -join ', ')"
}

$plan = New-WebsiteDeploymentPlan -IncludePaths $normalizedIncludePaths -RepoRoot $repoRoot

if (-not $Apply.IsPresent) {
    Write-Host "Preview mode only. No files were created."
    Write-Host "Run with -Apply to create staging folders and deployment plan."
    Write-Host "Staging root: $($paths.stagingRoot)"
    Write-Host "Planned include paths: $($normalizedIncludePaths -join ', ')"
    exit 0
}

Ensure-Directory -Path $paths.stagingRoot
Ensure-Directory -Path $paths.siteRoot
Ensure-Directory -Path $paths.metaRoot
Write-JsonFile -Value $plan -Path $paths.planPath

Write-Host "Prepared website deployment staging."
Write-Host "Staging root: $($paths.stagingRoot)"
Write-Host "Plan file: $($paths.planPath)"
Write-Host "Include paths: $($normalizedIncludePaths -join ', ')"
