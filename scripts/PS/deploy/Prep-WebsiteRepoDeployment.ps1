[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "Low")]
param(
    [string]$StagingRoot,
    [string[]]$IncludePaths,
    [int]$WebPort,
    [string]$EnvFilePath,
    [switch]$Apply,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "WebsiteRepoDeploymentCommon.ps1")
Assert-DeployScriptLocation -ScriptPath $PSCommandPath
$executionMode = Resolve-DeployExecutionMode -Apply:$Apply.IsPresent -DryRun:$DryRun.IsPresent
$resolvedWebPort = if ($PSBoundParameters.ContainsKey("WebPort")) { [Nullable[int]]$WebPort } else { $null }
$config = Resolve-DeployScriptConfig -StagingRoot $StagingRoot -IncludePaths $IncludePaths -WebPort $resolvedWebPort -EnvFilePath $EnvFilePath
Write-DeployConfigLoadLog -ScriptName "Prep-WebsiteRepoDeployment" -Config $config

$repoRoot = Get-DeployRepoRoot
$paths = Get-WebsiteDeploymentPaths -StagingRoot $config.stagingRoot
Test-StagingRootSafety -StagingRoot $paths.stagingRoot
$environment = Assert-DeployEnvironmentReadiness -Paths $paths

$normalizedIncludePaths = Normalize-IncludePaths -IncludePaths $config.includePaths
if ($normalizedIncludePaths.Count -eq 0) {
    $normalizedIncludePaths = Get-DefaultWebsiteIncludePaths
}
Assert-NormalizedIncludePaths -IncludePaths $normalizedIncludePaths

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

if ($executionMode.isDryRun) {
    Write-DeployLog -Level "INFO" -Message "Dry-run only. No files were created." -Data @{
        script = "Prep-WebsiteRepoDeployment"
        mode = $executionMode.label
        stagingRoot = $paths.stagingRoot
        includePaths = $normalizedIncludePaths
        dockerCliFound = $environment.dockerCliFound
    }
    Write-DeployLog -Level "INFO" -Message "Next step: run Prep-WebsiteRepoDeployment.ps1 -Apply after reviewing include paths and staging root."
    exit 0
}

if (-not $PSCmdlet.ShouldProcess($paths.stagingRoot, "Prepare website deployment staging")) {
    Write-DeployLog -Level "WARN" -Message "Preparation cancelled by ShouldProcess." -Data @{
        script = "Prep-WebsiteRepoDeployment"
        stagingRoot = $paths.stagingRoot
    }
    exit 0
}

Ensure-Directory -Path $paths.stagingRoot
Ensure-Directory -Path $paths.siteRoot
Ensure-Directory -Path $paths.metaRoot
Write-JsonFile -Value $plan -Path $paths.planPath
Write-DockerDeploymentArtifacts -Paths $paths -WebPort $config.webPort
Assert-DockerArtifactReadiness -Paths $paths

Write-DeployLog -Level "SUCCESS" -Message "Prepared website deployment staging." -Data @{
    script = "Prep-WebsiteRepoDeployment"
    mode = $executionMode.label
    stagingRoot = $paths.stagingRoot
    planPath = $paths.planPath
    dockerfilePath = $paths.dockerfilePath
    dockerCliFound = $environment.dockerCliFound
    webPort = $config.webPort
}
