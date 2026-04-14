[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "Medium")]
param(
    [string]$StagingRoot,
    [string[]]$IncludePaths,
    [switch]$Apply,
    [switch]$DryRun,
    [switch]$ConfirmDestructive
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "WebsiteRepoDeploymentCommon.ps1")
Assert-DeployScriptLocation -ScriptPath $PSCommandPath
$executionMode = Resolve-DeployExecutionMode -Apply:$Apply.IsPresent -DryRun:$DryRun.IsPresent

$repoRoot = Get-DeployRepoRoot
$paths = Get-WebsiteDeploymentPaths -StagingRoot $StagingRoot
Test-StagingRootSafety -StagingRoot $paths.stagingRoot
$environment = Assert-DeployEnvironmentReadiness -Paths $paths

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
Assert-NormalizedIncludePaths -IncludePaths $normalizedIncludePaths

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

if ($executionMode.isDryRun) {
    Write-DeployLog -Level "INFO" -Message "Dry-run only. No files were copied." -Data @{
        script = "Update-WebsiteRepoDeployment"
        mode = $executionMode.label
        siteRoot = $paths.siteRoot
        includePaths = $normalizedIncludePaths
        dockerCliFound = $environment.dockerCliFound
        destructiveConfirmationRequired = $true
    }
    Write-DeployLog -Level "INFO" -Message "Next step: run Update-WebsiteRepoDeployment.ps1 -Apply -ConfirmDestructive after reviewing the dry-run output."
    exit 0
}

if (-not $PSCmdlet.ShouldProcess($paths.siteRoot, "Refresh staged website deployment content")) {
    Write-DeployLog -Level "WARN" -Message "Update cancelled by ShouldProcess." -Data @{
        script = "Update-WebsiteRepoDeployment"
        siteRoot = $paths.siteRoot
    }
    exit 0
}

Ensure-Directory -Path $paths.stagingRoot
Ensure-Directory -Path $paths.metaRoot
Ensure-Directory -Path $paths.siteRoot

$existingSiteRoot = Test-Path -LiteralPath $paths.siteRoot
Assert-ExplicitDestructiveConfirmation -IsDryRun:$executionMode.isDryRun -ConfirmDestructive:$ConfirmDestructive.IsPresent -OperationName "Update-WebsiteRepoDeployment site refresh" -TargetCount $(if ($existingSiteRoot) { 1 } else { 0 })

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
Write-DockerDeploymentArtifacts -Paths $paths
Assert-DockerArtifactReadiness -Paths $paths

$report = [ordered]@{
    schema = "html-js-gaming.website-repo-deploy-update-report"
    version = 1
    updatedUtc = [DateTime]::UtcNow.ToString("o")
    stagingRoot = $paths.stagingRoot
    siteRoot = $paths.siteRoot
    entryCount = $copyEntries.Count
    copiedEntries = $copyEntries
    dockerCompatible = $true
}
Write-JsonFile -Value $report -Path $paths.updateReportPath

Write-DeployLog -Level "SUCCESS" -Message "Updated website deployment staging content." -Data @{
    script = "Update-WebsiteRepoDeployment"
    mode = $executionMode.label
    siteRoot = $paths.siteRoot
    copiedEntries = $copyEntries.Count
    dockerfilePath = $paths.dockerfilePath
    reportPath = $paths.updateReportPath
    dockerCliFound = $environment.dockerCliFound
}
