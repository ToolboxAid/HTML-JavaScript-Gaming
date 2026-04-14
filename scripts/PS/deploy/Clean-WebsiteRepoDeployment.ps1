[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [string]$StagingRoot,
    [switch]$RemoveMetadata,
    [switch]$Apply,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "WebsiteRepoDeploymentCommon.ps1")

if ($Apply.IsPresent -and $DryRun.IsPresent) {
    throw "Use either -Apply or -DryRun, not both."
}

$paths = Get-WebsiteDeploymentPaths -StagingRoot $StagingRoot
Test-StagingRootSafety -StagingRoot $paths.stagingRoot

$targets = New-Object System.Collections.Generic.List[string]
if (Test-Path -LiteralPath $paths.siteRoot) {
    $targets.Add($paths.siteRoot)
}
if ($RemoveMetadata.IsPresent) {
    foreach ($metadataPath in @($paths.planPath, $paths.updateReportPath, $paths.dockerfilePath, $paths.composePath, $paths.dockerIgnorePath)) {
        if (Test-Path -LiteralPath $metadataPath) {
            $targets.Add($metadataPath)
        }
    }
}

if ($targets.Count -eq 0) {
    Write-Host "Nothing to clean."
    exit 0
}

if (-not $Apply.IsPresent -or $DryRun.IsPresent) {
    Write-Host "Dry-run only. No files were deleted."
    Write-Host "Run with -Apply to remove deployment artifacts."
    foreach ($target in $targets) {
        Write-Host " - $target"
    }
    exit 0
}

foreach ($target in $targets) {
    if (-not (Test-PathWithinRoot -Path $target -RootPath $paths.stagingRoot)) {
        throw "Safety check failed. Target escapes staging root: $target"
    }
}

foreach ($target in $targets) {
    Remove-Item -LiteralPath $target -Recurse -Force
}

Write-Host "Cleaned website deployment artifacts."
