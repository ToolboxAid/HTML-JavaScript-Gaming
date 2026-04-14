[CmdletBinding()]
param(
    [string]$StagingRoot,
    [switch]$RemoveMetadata,
    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "WebsiteRepoDeploymentCommon.ps1")

$repoRoot = Get-CodexRepoRoot
$paths = Get-WebsiteDeploymentPaths -StagingRoot $StagingRoot

if (-not (Test-PathWithinRoot -Path $paths.stagingRoot -RootPath (Join-Path $repoRoot "tmp"))) {
    throw "Safety check failed. Staging root must remain under <repo>/tmp: $($paths.stagingRoot)"
}

$targets = New-Object System.Collections.Generic.List[string]
if (Test-Path -LiteralPath $paths.siteRoot) {
    $targets.Add($paths.siteRoot)
}
if ($RemoveMetadata.IsPresent) {
    if (Test-Path -LiteralPath $paths.planPath) {
        $targets.Add($paths.planPath)
    }
    if (Test-Path -LiteralPath $paths.updateReportPath) {
        $targets.Add($paths.updateReportPath)
    }
}

if ($targets.Count -eq 0) {
    Write-Host "Nothing to clean."
    exit 0
}

if (-not $Apply.IsPresent) {
    Write-Host "Preview mode only. No files were deleted."
    Write-Host "Run with -Apply to remove deployment artifacts."
    Write-Host "Targets:"
    foreach ($target in $targets) {
        Write-Host " - $target"
    }
    exit 0
}

foreach ($target in $targets) {
    if (-not (Test-PathWithinRoot -Path $target -RootPath $paths.stagingRoot)) {
        throw "Safety check failed. Target escapes staging root: $target"
    }
    Remove-Item -LiteralPath $target -Recurse -Force
}

Write-Host "Cleaned website deployment artifacts."
Write-Host "Removed targets: $($targets.Count)"
