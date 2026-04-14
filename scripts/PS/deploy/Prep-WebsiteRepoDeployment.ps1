[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "Low")]
param(
    [string]$StagingRoot,
    [string[]]$IncludePaths,
    [switch]$Apply,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "WebsiteRepoDeploymentCommon.ps1")

if ($Apply.IsPresent -and $DryRun.IsPresent) {
    throw "Use either -Apply or -DryRun, not both."
}

$repoRoot = Get-DeployRepoRoot
$paths = Get-WebsiteDeploymentPaths -StagingRoot $StagingRoot
Test-StagingRootSafety -StagingRoot $paths.stagingRoot

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

if (-not $Apply.IsPresent -or $DryRun.IsPresent) {
    Write-Host "Dry-run only. No files were created."
    Write-Host "Run with -Apply to create staging folders, deployment plan, and Docker artifacts."
    Write-Host "Staging root: $($paths.stagingRoot)"
    Write-Host "Planned include paths: $($normalizedIncludePaths -join ', ')"
    exit 0
}

if (-not $PSCmdlet.ShouldProcess($paths.stagingRoot, "Prepare website deployment staging")) {
    Write-Host "Preparation cancelled."
    exit 0
}

Ensure-Directory -Path $paths.stagingRoot
Ensure-Directory -Path $paths.siteRoot
Ensure-Directory -Path $paths.metaRoot
Write-JsonFile -Value $plan -Path $paths.planPath
Write-DockerDeploymentArtifacts -Paths $paths

Write-Host "Prepared website deployment staging."
Write-Host "Staging root: $($paths.stagingRoot)"
Write-Host "Plan file: $($paths.planPath)"
Write-Host "Dockerfile: $($paths.dockerfilePath)"
