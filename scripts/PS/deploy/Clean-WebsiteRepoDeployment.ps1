[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [string]$StagingRoot,
    [switch]$RemoveMetadata,
    [switch]$Apply,
    [switch]$DryRun,
    [switch]$ConfirmDestructive
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "WebsiteRepoDeploymentCommon.ps1")
Assert-DeployScriptLocation -ScriptPath $PSCommandPath
$executionMode = Resolve-DeployExecutionMode -Apply:$Apply.IsPresent -DryRun:$DryRun.IsPresent

$paths = Get-WebsiteDeploymentPaths -StagingRoot $StagingRoot
Test-StagingRootSafety -StagingRoot $paths.stagingRoot
$environment = Assert-DeployEnvironmentReadiness -Paths $paths

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
    Write-DeployLog -Level "INFO" -Message "Nothing to clean." -Data @{
        script = "Clean-WebsiteRepoDeployment"
        stagingRoot = $paths.stagingRoot
    }
    exit 0
}

if ($executionMode.isDryRun) {
    Write-DeployLog -Level "INFO" -Message "Dry-run only. No files were deleted." -Data @{
        script = "Clean-WebsiteRepoDeployment"
        mode = $executionMode.label
        targetCount = $targets.Count
        targets = @($targets)
        dockerCliFound = $environment.dockerCliFound
        destructiveConfirmationRequired = $true
    }
    Write-DeployLog -Level "INFO" -Message "Next step: run Clean-WebsiteRepoDeployment.ps1 -Apply -ConfirmDestructive after reviewing the dry-run output."
    exit 0
}

Assert-ExplicitDestructiveConfirmation -IsDryRun:$executionMode.isDryRun -ConfirmDestructive:$ConfirmDestructive.IsPresent -OperationName "Clean-WebsiteRepoDeployment delete" -TargetCount $targets.Count

foreach ($target in $targets) {
    if (-not (Test-PathWithinRoot -Path $target -RootPath $paths.stagingRoot)) {
        throw "Safety check failed. Target escapes staging root: $target"
    }
}

foreach ($target in $targets) {
    Remove-Item -LiteralPath $target -Recurse -Force
}

Write-DeployLog -Level "SUCCESS" -Message "Cleaned website deployment artifacts." -Data @{
    script = "Clean-WebsiteRepoDeployment"
    mode = $executionMode.label
    targetCount = $targets.Count
    dockerCliFound = $environment.dockerCliFound
}
