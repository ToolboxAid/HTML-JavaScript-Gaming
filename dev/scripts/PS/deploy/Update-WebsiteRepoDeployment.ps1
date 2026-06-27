[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "Medium")]
param(
    [string]$StagingRoot,
    [string[]]$IncludePaths,
    [int]$WebPort,
    [string]$EnvFilePath,
    [switch]$Apply,
    [switch]$DryRun,
    [switch]$ConfirmDestructive,
    [switch]$SkipPostDeployVerification,
    [switch]$RollbackOnVerificationFailure
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "WebsiteRepoDeploymentCommon.ps1")
Assert-DeployScriptLocation -ScriptPath $PSCommandPath
$executionMode = Resolve-DeployExecutionMode -Apply:$Apply.IsPresent -DryRun:$DryRun.IsPresent
$resolvedWebPort = if ($PSBoundParameters.ContainsKey("WebPort")) { [Nullable[int]]$WebPort } else { $null }
$config = Resolve-DeployScriptConfig -StagingRoot $StagingRoot -IncludePaths $IncludePaths -WebPort $resolvedWebPort -EnvFilePath $EnvFilePath
Write-DeployConfigLoadLog -ScriptName "Update-WebsiteRepoDeployment" -Config $config

$repoRoot = Get-DeployRepoRoot
$paths = Get-WebsiteDeploymentPaths -StagingRoot $config.stagingRoot
Test-StagingRootSafety -StagingRoot $paths.stagingRoot
$environment = Assert-DeployEnvironmentReadiness -Paths $paths

$normalizedIncludePaths = Normalize-IncludePaths -IncludePaths $config.includePaths
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
    Write-DeployLog -Level "INFO" -Message "Rollback/abort expectation: verification failures abort by default; add -RollbackOnVerificationFailure to auto-clean staging artifacts."
    exit 0
}

if ($RollbackOnVerificationFailure.IsPresent -and -not $ConfirmDestructive.IsPresent) {
    throw "Rollback requires -ConfirmDestructive because rollback cleanup deletes staged artifacts."
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
Write-DeployOpsState -Paths $paths -Operation "update" -Stage "refresh-site-content" -Status "running" -Message "Refreshing staged website content." -Data @{
    includePathCount = $normalizedIncludePaths.Count
}
Write-DeployOpsEvent -Paths $paths -Operation "update" -Stage "refresh-site-content" -Status "start" -Message "Starting staged website refresh." -Data @{
    includePathCount = $normalizedIncludePaths.Count
}

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
Write-DockerDeploymentArtifacts -Paths $paths -WebPort $config.webPort
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

Write-DeployOpsState -Paths $paths -Operation "update" -Stage "refresh-site-content" -Status "success" -Message "Staged website refresh completed." -Data @{
    copiedEntries = $copyEntries.Count
    reportPath = $paths.updateReportPath
}
Write-DeployOpsEvent -Paths $paths -Operation "update" -Stage "refresh-site-content" -Status "success" -Message "Staged website refresh completed." -Data @{
    copiedEntries = $copyEntries.Count
    reportPath = $paths.updateReportPath
}

$verificationPassed = $true
if (-not $SkipPostDeployVerification.IsPresent) {
    Write-DeployOpsState -Paths $paths -Operation "update" -Stage "post-deploy-verification" -Status "running" -Message "Running post-deploy verification checks."
    Write-DeployOpsEvent -Paths $paths -Operation "update" -Stage "post-deploy-verification" -Status "start" -Message "Running post-deploy verification checks."

    $verification = Get-WebsiteDeploymentVerificationResult -Paths $paths -ExpectedIncludePaths $normalizedIncludePaths
    Write-JsonFile -Value $verification -Path $paths.verifyReportPath

    if (-not $verification.passed) {
        $verificationPassed = $false
        Write-DeployOpsState -Paths $paths -Operation "update" -Stage "post-deploy-verification" -Status "error" -Message "Post-deploy verification failed." -Data @{
            verifyReportPath = $paths.verifyReportPath
            failedCheckCount = $verification.failedCheckCount
        }
        Write-DeployOpsEvent -Paths $paths -Operation "update" -Stage "post-deploy-verification" -Status "error" -Message "Post-deploy verification failed." -Data @{
            verifyReportPath = $paths.verifyReportPath
            failedCheckCount = $verification.failedCheckCount
        }

        if ($RollbackOnVerificationFailure.IsPresent) {
            Write-DeployOpsEvent -Paths $paths -Operation "update" -Stage "rollback-on-verification-failure" -Status "warn" -Message "Verification failed. Starting rollback cleanup of staging artifacts." -Data @{
                rollbackMode = "clean-staging"
            }

            $cleanScriptPath = Join-Path $PSScriptRoot "Clean-WebsiteRepoDeployment.ps1"
            & $cleanScriptPath -StagingRoot $paths.stagingRoot -RemoveMetadata -EnvFilePath $config.envFilePath -Apply -ConfirmDestructive -Confirm:$false

            Write-DeployOpsEvent -Paths $paths -Operation "update" -Stage "rollback-on-verification-failure" -Status "success" -Message "Rollback cleanup completed." -Data @{
                rollbackMode = "clean-staging"
            }
        }

        throw "Post-deploy verification failed. Review $($paths.verifyReportPath). Update operation aborted."
    }

    Write-DeployOpsState -Paths $paths -Operation "update" -Stage "post-deploy-verification" -Status "success" -Message "Post-deploy verification passed." -Data @{
        verifyReportPath = $paths.verifyReportPath
    }
    Write-DeployOpsEvent -Paths $paths -Operation "update" -Stage "post-deploy-verification" -Status "success" -Message "Post-deploy verification passed." -Data @{
        verifyReportPath = $paths.verifyReportPath
    }
}
else {
    Write-DeployOpsEvent -Paths $paths -Operation "update" -Stage "post-deploy-verification" -Status "warn" -Message "Post-deploy verification skipped by operator switch." -Data @{
        skippedBySwitch = $true
    }
}

Write-DeployLog -Level "SUCCESS" -Message "Updated website deployment staging content." -Data @{
    script = "Update-WebsiteRepoDeployment"
    mode = $executionMode.label
    siteRoot = $paths.siteRoot
    copiedEntries = $copyEntries.Count
    dockerfilePath = $paths.dockerfilePath
    reportPath = $paths.updateReportPath
    dockerCliFound = $environment.dockerCliFound
    webPort = $config.webPort
    postDeployVerificationPassed = $verificationPassed
    verifyReportPath = $paths.verifyReportPath
}
