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
    if (Test-Path -LiteralPath $paths.planPath) {
        $existingPlan = Read-JsonFile -Path $paths.planPath
        $normalizedIncludePaths = Normalize-IncludePaths -IncludePaths $existingPlan.includePaths
    }
    if ($normalizedIncludePaths.Count -eq 0) {
        $normalizedIncludePaths = Get-DefaultWebsiteIncludePaths
    }
}

$copyEntries = New-Object System.Collections.Generic.List[object]
foreach ($entry in $normalizedIncludePaths) {
    $sourcePath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $entry))
    if (-not (Test-PathWithinRoot -Path $sourcePath -RootPath $repoRoot)) {
        throw "Include path escapes repo root: $entry"
    }
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        throw "Include path not found: $entry"
    }

    $destinationPath = [System.IO.Path]::GetFullPath((Join-Path $paths.siteRoot $entry))
    if (-not (Test-PathWithinRoot -Path $destinationPath -RootPath $paths.siteRoot)) {
        throw "Resolved destination escapes site root: $destinationPath"
    }

    $copyEntries.Add([ordered]@{
        includePath = $entry
        sourcePath = $sourcePath
        destinationPath = $destinationPath
    })
}

if (-not $Apply.IsPresent) {
    Write-Host "Preview mode only. No files were copied."
    Write-Host "Run with -Apply to update website deployment staging content."
    Write-Host "Site root: $($paths.siteRoot)"
    Write-Host "Entries: $($normalizedIncludePaths -join ', ')"
    exit 0
}

Ensure-Directory -Path $paths.stagingRoot
Ensure-Directory -Path $paths.metaRoot
Ensure-Directory -Path $paths.siteRoot

if (Test-Path -LiteralPath $paths.siteRoot) {
    if (-not (Test-PathWithinRoot -Path $paths.siteRoot -RootPath $paths.stagingRoot)) {
        throw "Site root safety check failed: $($paths.siteRoot)"
    }
    Remove-Item -LiteralPath $paths.siteRoot -Recurse -Force
}
Ensure-Directory -Path $paths.siteRoot

foreach ($entry in $copyEntries) {
    $destinationParent = Split-Path -Path $entry.destinationPath -Parent
    Ensure-Directory -Path $destinationParent
    Copy-Item -LiteralPath $entry.sourcePath -Destination $entry.destinationPath -Recurse -Force
}

$plan = New-WebsiteDeploymentPlan -IncludePaths $normalizedIncludePaths -RepoRoot $repoRoot
Write-JsonFile -Value $plan -Path $paths.planPath

$report = [ordered]@{
    schema = "html-js-gaming.website-repo-deploy-update-report"
    version = 1
    updatedUtc = [DateTime]::UtcNow.ToString("o")
    stagingRoot = $paths.stagingRoot
    siteRoot = $paths.siteRoot
    entryCount = $copyEntries.Count
    copiedEntries = $copyEntries
}
Write-JsonFile -Value $report -Path $paths.updateReportPath

Write-Host "Updated website deployment staging content."
Write-Host "Site root: $($paths.siteRoot)"
Write-Host "Copied entries: $($copyEntries.Count)"
Write-Host "Report file: $($paths.updateReportPath)"
