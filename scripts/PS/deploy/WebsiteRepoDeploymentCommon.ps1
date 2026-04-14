Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-DeployExpectedScriptsRoot {
    return [System.IO.Path]::GetFullPath((Join-Path (Get-DeployRepoRoot) "scripts\PS\deploy"))
}

function Assert-DeployScriptLocation {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptPath
    )

    $resolvedScriptPath = [System.IO.Path]::GetFullPath($ScriptPath)
    $resolvedScriptRoot = [System.IO.Path]::GetFullPath((Split-Path -Path $resolvedScriptPath -Parent))
    $expectedRoot = Get-DeployExpectedScriptsRoot

    if (-not [string]::Equals(
            $resolvedScriptRoot.TrimEnd('\', '/'),
            $expectedRoot.TrimEnd('\', '/'),
            [StringComparison]::OrdinalIgnoreCase
        )) {
        throw "Deployment script placement check failed. Expected scripts under '$expectedRoot' but script was loaded from '$resolvedScriptRoot'. Run scripts/PS/validate/Validate-ScriptStructure.ps1 for details."
    }
}

function Resolve-DeployExecutionMode {
    param(
        [switch]$Apply,
        [switch]$DryRun
    )

    if ($Apply.IsPresent -and $DryRun.IsPresent) {
        throw "Use either -Apply or -DryRun, not both."
    }

    $isDryRun = -not $Apply.IsPresent -or $DryRun.IsPresent
    return [ordered]@{
        isDryRun = $isDryRun
        label = if ($isDryRun) { "dry-run" } else { "apply" }
    }
}

function Assert-ExplicitDestructiveConfirmation {
    param(
        [Parameter(Mandatory = $true)]
        [bool]$IsDryRun,
        [switch]$ConfirmDestructive,
        [Parameter(Mandatory = $true)]
        [string]$OperationName,
        [int]$TargetCount = 1
    )

    if ($IsDryRun -or $TargetCount -le 0) {
        return
    }

    if (-not $ConfirmDestructive.IsPresent) {
        throw "Destructive execution blocked for '$OperationName'. Re-run with -Apply -ConfirmDestructive after reviewing the dry-run output."
    }
}

function Write-DeployLog {
    param(
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO",
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [hashtable]$Data
    )

    $timestamp = [DateTime]::UtcNow.ToString("o")
    $prefix = "[deploy][$timestamp][$Level]"
    if ($Data) {
        $payload = $Data | ConvertTo-Json -Compress -Depth 10
        Write-Host "$prefix $Message $payload"
        return
    }

    Write-Host "$prefix $Message"
}

function Get-DeployEnvironmentStatus {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Paths
    )

    $repoRoot = Get-DeployRepoRoot
    $tmpRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "tmp"))
    $dockerCommand = Get-Command docker -ErrorAction SilentlyContinue

    return [ordered]@{
        repoRoot = $repoRoot
        repoRootExists = Test-Path -LiteralPath $repoRoot
        tmpRoot = $tmpRoot
        tmpRootExists = Test-Path -LiteralPath $tmpRoot
        stagingRoot = $Paths.stagingRoot
        dockerCliFound = $null -ne $dockerCommand
    }
}

function Assert-DeployEnvironmentReadiness {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Paths
    )

    $status = Get-DeployEnvironmentStatus -Paths $Paths
    if (-not $status.repoRootExists) {
        throw "Environment validation failed. Repo root not found: $($status.repoRoot)"
    }

    if (-not $status.tmpRootExists) {
        throw "Environment validation failed. Required tmp root not found: $($status.tmpRoot)"
    }

    if (-not (Test-PathWithinRoot -Path $status.stagingRoot -RootPath $status.tmpRoot)) {
        throw "Environment validation failed. Staging root must remain under tmp root: $($status.stagingRoot)"
    }

    return $status
}

function Get-DeployRepoRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
}

function Resolve-DeployConfigPath {
    param(
        [string]$EnvFilePath
    )

    if ([string]::IsNullOrWhiteSpace($EnvFilePath)) {
        return [System.IO.Path]::GetFullPath((Join-Path (Get-DeployRepoRoot) ".env"))
    }

    if ([System.IO.Path]::IsPathRooted($EnvFilePath)) {
        return [System.IO.Path]::GetFullPath($EnvFilePath)
    }

    return [System.IO.Path]::GetFullPath((Join-Path (Get-DeployRepoRoot) $EnvFilePath))
}

function Remove-DeployValueQuotes {
    param(
        [string]$Value
    )

    if ($null -eq $Value) {
        return ""
    }

    $trimmed = $Value.Trim()
    if ($trimmed.Length -ge 2) {
        if (($trimmed.StartsWith('"') -and $trimmed.EndsWith('"')) -or ($trimmed.StartsWith("'") -and $trimmed.EndsWith("'"))) {
            return $trimmed.Substring(1, $trimmed.Length - 2)
        }
    }
    return $trimmed
}

function Read-DeployDotEnvFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $pairs = @{}
    if (-not (Test-Path -LiteralPath $Path)) {
        return $pairs
    }

    $lines = Get-Content -LiteralPath $Path -Encoding UTF8
    foreach ($line in $lines) {
        $current = [string]$line
        if ([string]::IsNullOrWhiteSpace($current)) {
            continue
        }

        $trimmed = $current.Trim()
        if ($trimmed.StartsWith("#")) {
            continue
        }

        if ($trimmed.StartsWith("export ")) {
            $trimmed = $trimmed.Substring(7).Trim()
        }

        $delimiterIndex = $trimmed.IndexOf("=")
        if ($delimiterIndex -le 0) {
            continue
        }

        $rawName = $trimmed.Substring(0, $delimiterIndex).Trim()
        $rawValue = $trimmed.Substring($delimiterIndex + 1)
        if ([string]::IsNullOrWhiteSpace($rawName)) {
            continue
        }

        $pairs[$rawName] = Remove-DeployValueQuotes -Value $rawValue
    }

    return $pairs
}

function Get-DeployDotEnvValue {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$DotEnv,
        [Parameter(Mandatory = $true)]
        [string]$CanonicalName,
        [string[]]$LegacyNames
    )

    if ($DotEnv.ContainsKey($CanonicalName)) {
        return [ordered]@{
            value = [string]$DotEnv[$CanonicalName]
            source = $CanonicalName
            isLegacy = $false
        }
    }

    foreach ($legacyName in $LegacyNames) {
        if ($DotEnv.ContainsKey($legacyName)) {
            return [ordered]@{
                value = [string]$DotEnv[$legacyName]
                source = $legacyName
                isLegacy = $true
            }
        }
    }

    return [ordered]@{
        value = $null
        source = $null
        isLegacy = $false
    }
}

function ConvertTo-DeployBoolean {
    param(
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    $normalized = $Value.Trim().ToLowerInvariant()
    if ($normalized -in @("1", "true", "yes", "y", "on")) {
        return $true
    }

    if ($normalized -in @("0", "false", "no", "n", "off")) {
        return $false
    }

    throw "Invalid boolean value '$Value'. Expected one of: true/false, yes/no, on/off, 1/0."
}

function ConvertTo-DeployPort {
    param(
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    $parsedPort = 0
    if (-not [int]::TryParse($Value.Trim(), [ref]$parsedPort)) {
        throw "Invalid DEPLOY_WEB_PORT value '$Value'. Expected an integer between 1 and 65535."
    }

    if ($parsedPort -lt 1 -or $parsedPort -gt 65535) {
        throw "Invalid DEPLOY_WEB_PORT value '$Value'. Expected an integer between 1 and 65535."
    }

    return $parsedPort
}

function ConvertTo-DeployIncludePathList {
    param(
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return @()
    }

    return @(
        $Value -split '[,;]'
    )
}

function Resolve-DeployScriptConfig {
    param(
        [string]$StagingRoot,
        [string[]]$IncludePaths,
        [object]$RemoveMetadata,
        [object]$WebPort,
        [string]$EnvFilePath
    )

    $resolvedEnvFilePath = Resolve-DeployConfigPath -EnvFilePath $EnvFilePath
    $dotEnv = Read-DeployDotEnvFile -Path $resolvedEnvFilePath

    $legacyVariablesUsed = New-Object System.Collections.Generic.List[string]

    $stagingRootValue = Get-DeployDotEnvValue -DotEnv $dotEnv -CanonicalName "DEPLOY_STAGING_ROOT" -LegacyNames @("STAGING_ROOT")
    if ($stagingRootValue.isLegacy) { $legacyVariablesUsed.Add($stagingRootValue.source) }

    $includePathsValue = Get-DeployDotEnvValue -DotEnv $dotEnv -CanonicalName "DEPLOY_INCLUDE_PATHS" -LegacyNames @("INCLUDE_PATHS")
    if ($includePathsValue.isLegacy) { $legacyVariablesUsed.Add($includePathsValue.source) }

    $removeMetadataValue = Get-DeployDotEnvValue -DotEnv $dotEnv -CanonicalName "DEPLOY_REMOVE_METADATA" -LegacyNames @("REMOVE_METADATA")
    if ($removeMetadataValue.isLegacy) { $legacyVariablesUsed.Add($removeMetadataValue.source) }

    $webPortValue = Get-DeployDotEnvValue -DotEnv $dotEnv -CanonicalName "DEPLOY_WEB_PORT" -LegacyNames @("PORT")
    if ($webPortValue.isLegacy) { $legacyVariablesUsed.Add($webPortValue.source) }

    $resolvedStagingRoot = if (-not [string]::IsNullOrWhiteSpace($StagingRoot)) {
        $StagingRoot
    }
    elseif (-not [string]::IsNullOrWhiteSpace($stagingRootValue.value)) {
        $stagingRootValue.value
    }
    else {
        $null
    }

    $resolvedIncludePaths = if ($IncludePaths -and $IncludePaths.Count -gt 0) {
        $IncludePaths
    }
    elseif (-not [string]::IsNullOrWhiteSpace($includePathsValue.value)) {
        ConvertTo-DeployIncludePathList -Value $includePathsValue.value
    }
    else {
        @()
    }

    $resolvedRemoveMetadata = if ($null -ne $RemoveMetadata) {
        [bool]$RemoveMetadata
    }
    else {
        $parsedRemoveMetadata = ConvertTo-DeployBoolean -Value $removeMetadataValue.value
        if ($null -eq $parsedRemoveMetadata) { $false } else { [bool]$parsedRemoveMetadata }
    }

    $resolvedWebPort = if ($null -ne $WebPort) {
        [int]$WebPort
    }
    else {
        $parsedWebPort = ConvertTo-DeployPort -Value $webPortValue.value
        if ($null -eq $parsedWebPort) { 8080 } else { [int]$parsedWebPort }
    }

    return [ordered]@{
        stagingRoot = $resolvedStagingRoot
        includePaths = @($resolvedIncludePaths)
        removeMetadata = [bool]$resolvedRemoveMetadata
        webPort = [int]$resolvedWebPort
        envFilePath = $resolvedEnvFilePath
        envFileLoaded = Test-Path -LiteralPath $resolvedEnvFilePath
        legacyVariablesUsed = @($legacyVariablesUsed)
    }
}

function Write-DeployConfigLoadLog {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptName,
        [Parameter(Mandatory = $true)]
        [object]$Config
    )

    Write-DeployLog -Level "INFO" -Message "Loaded deploy configuration." -Data @{
        script = $ScriptName
        envFilePath = $Config.envFilePath
        envFileLoaded = $Config.envFileLoaded
        webPort = $Config.webPort
    }

    if ($Config.legacyVariablesUsed.Count -gt 0) {
        Write-DeployLog -Level "WARN" -Message "Legacy deploy environment variable names detected. Prefer DEPLOY_* names." -Data @{
            script = $ScriptName
            legacyVariablesUsed = $Config.legacyVariablesUsed
        }
    }
}

function Resolve-WebsiteStagingRoot {
    param(
        [string]$StagingRoot
    )

    if ([string]::IsNullOrWhiteSpace($StagingRoot)) {
        return [System.IO.Path]::GetFullPath((Join-Path (Get-DeployRepoRoot) "tmp\website-deploy"))
    }

    return [System.IO.Path]::GetFullPath($StagingRoot)
}

function Get-WebsiteDeploymentPaths {
    param(
        [string]$StagingRoot
    )

    $resolvedStagingRoot = Resolve-WebsiteStagingRoot -StagingRoot $StagingRoot
    return [ordered]@{
        stagingRoot = $resolvedStagingRoot
        siteRoot = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "site"))
        metaRoot = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta"))
        planPath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta\website-deploy-plan.json"))
        updateReportPath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta\website-deploy-last-update.json"))
        verifyReportPath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta\website-deploy-last-verify.json"))
        opsLogPath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta\website-deploy-ops-log.jsonl"))
        opsStatePath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta\website-deploy-ops-state.json"))
        dockerfilePath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "Dockerfile"))
        composePath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "docker-compose.yml"))
        dockerIgnorePath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot ".dockerignore"))
    }
}

function Write-DeployOpsEvent {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Paths,
        [Parameter(Mandatory = $true)]
        [string]$Operation,
        [Parameter(Mandatory = $true)]
        [string]$Stage,
        [ValidateSet("start", "success", "warn", "error")]
        [string]$Status = "start",
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [hashtable]$Data
    )

    Ensure-Directory -Path $Paths.metaRoot

    $eventRecord = [ordered]@{
        schema = "html-js-gaming.website-repo-deploy-ops-event"
        version = 1
        timestampUtc = [DateTime]::UtcNow.ToString("o")
        operation = $Operation
        stage = $Stage
        status = $Status
        message = $Message
        data = if ($Data) { $Data } else { [ordered]@{} }
    }

    $line = ($eventRecord | ConvertTo-Json -Compress -Depth 20) + [Environment]::NewLine
    [System.IO.File]::AppendAllText($Paths.opsLogPath, $line, [System.Text.Encoding]::UTF8)

    $level = switch ($Status) {
        "success" { "SUCCESS" }
        "warn" { "WARN" }
        "error" { "ERROR" }
        default { "INFO" }
    }

    $logPayload = [ordered]@{
        operation = $Operation
        stage = $Stage
        status = $Status
    }
    if ($Data) {
        foreach ($key in $Data.Keys) {
            $logPayload[$key] = $Data[$key]
        }
    }

    Write-DeployLog -Level $level -Message $Message -Data $logPayload
}

function Write-DeployOpsState {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Paths,
        [Parameter(Mandatory = $true)]
        [string]$Operation,
        [Parameter(Mandatory = $true)]
        [string]$Stage,
        [Parameter(Mandatory = $true)]
        [string]$Status,
        [string]$Message,
        [hashtable]$Data
    )

    $state = [ordered]@{
        schema = "html-js-gaming.website-repo-deploy-ops-state"
        version = 1
        updatedUtc = [DateTime]::UtcNow.ToString("o")
        operation = $Operation
        stage = $Stage
        status = $Status
        message = $Message
        stagingRoot = $Paths.stagingRoot
        data = if ($Data) { $Data } else { [ordered]@{} }
    }

    Write-JsonFile -Value $state -Path $Paths.opsStatePath
}

function Get-WebsiteDeploymentVerificationResult {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Paths,
        [string[]]$ExpectedIncludePaths
    )

    $checks = New-Object System.Collections.ArrayList

    $siteRootExists = Test-Path -LiteralPath $Paths.siteRoot
    [void]$checks.Add([pscustomobject]@{
            name = "siteRootExists"
            passed = $siteRootExists
            details = if ($siteRootExists) { "Site root exists." } else { "Site root is missing: $($Paths.siteRoot)" }
        })

    $dockerReady = $true
    $dockerDetails = "Docker deployment artifacts validated."
    try {
        Assert-DockerArtifactReadiness -Paths $Paths
    }
    catch {
        $dockerReady = $false
        $dockerDetails = $_.Exception.Message
    }
    [void]$checks.Add([pscustomobject]@{
            name = "dockerArtifactsReady"
            passed = $dockerReady
            details = $dockerDetails
        })

    $normalizedExpected = Normalize-IncludePaths -IncludePaths $ExpectedIncludePaths
    foreach ($entry in $normalizedExpected) {
        $targetPath = [System.IO.Path]::GetFullPath((Join-Path $Paths.siteRoot $entry))
        $exists = Test-Path -LiteralPath $targetPath
        [void]$checks.Add([pscustomobject]@{
                name = "includePathExists:$entry"
                passed = $exists
                details = if ($exists) { "Found expected staged entry." } else { "Missing expected staged entry: $targetPath" }
            })
    }

    $failedChecks = @($checks | Where-Object { -not $_.passed })
    return [pscustomobject]@{
        schema = "html-js-gaming.website-repo-deploy-verify-report"
        version = 1
        verifiedUtc = [DateTime]::UtcNow.ToString("o")
        stagingRoot = $Paths.stagingRoot
        siteRoot = $Paths.siteRoot
        expectedIncludePaths = $normalizedExpected
        checks = @($checks)
        passed = ($failedChecks.Count -eq 0)
        failedCheckCount = $failedChecks.Count
    }
}

function Ensure-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Value,
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $directory = Split-Path -Path $Path -Parent
    Ensure-Directory -Path $directory
    $json = $Value | ConvertTo-Json -Depth 20
    [System.IO.File]::WriteAllText($Path, $json + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
}

function Read-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "JSON file not found: $Path"
    }

    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    return $raw | ConvertFrom-Json
}

function Test-PathWithinRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$RootPath
    )

    $resolvedPath = [System.IO.Path]::GetFullPath($Path)
    $resolvedRoot = [System.IO.Path]::GetFullPath($RootPath)
    $normalizedRoot = $resolvedRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
    return $resolvedPath.StartsWith($normalizedRoot, [StringComparison]::OrdinalIgnoreCase)
}

function Test-StagingRootSafety {
    param(
        [Parameter(Mandatory = $true)]
        [string]$StagingRoot
    )

    $repoRoot = Get-DeployRepoRoot
    $tmpRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "tmp"))
    if (-not (Test-PathWithinRoot -Path $StagingRoot -RootPath $tmpRoot)) {
        throw "Safety check failed. Staging root must remain under <repo>/tmp: $StagingRoot"
    }
}

function Normalize-IncludePaths {
    param(
        [string[]]$IncludePaths
    )

    $source = if ($IncludePaths) { $IncludePaths } else { @() }
    $output = New-Object System.Collections.Generic.List[string]
    $seen = New-Object System.Collections.Generic.HashSet[string]([StringComparer]::OrdinalIgnoreCase)

    foreach ($entry in $source) {
        $raw = if ($null -eq $entry) { "" } else { [string]$entry }
        $normalized = $raw.Trim() -replace "\\", "/"
        $normalized = $normalized.Trim("/")
        if ([string]::IsNullOrWhiteSpace($normalized)) {
            continue
        }
        if ($seen.Add($normalized)) {
            $output.Add($normalized)
        }
    }

    return ,$output.ToArray()
}

function Assert-NormalizedIncludePaths {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$IncludePaths
    )

    foreach ($entry in $IncludePaths) {
        if ([string]::IsNullOrWhiteSpace($entry)) {
            continue
        }

        if ([System.IO.Path]::IsPathRooted($entry)) {
            throw "Include path must be repo-relative, but was rooted: $entry"
        }

        if ($entry.Contains(":")) {
            throw "Include path must not contain drive/URI separators: $entry"
        }

        if ($entry.IndexOfAny([char[]]@('*', '?')) -ge 0) {
            throw "Include path wildcard patterns are not allowed: $entry"
        }

        $segments = $entry.Split("/")
        if ($segments -contains "..") {
            throw "Include path traversal is not allowed: $entry"
        }
    }
}

function New-WebsiteDeploymentPlan {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$IncludePaths,
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    return [ordered]@{
        schema = "html-js-gaming.website-repo-deploy-plan"
        version = 1
        generatedUtc = [DateTime]::UtcNow.ToString("o")
        repoRoot = $RepoRoot
        includePaths = $IncludePaths
        dockerCompatible = $true
    }
}

function Get-DefaultWebsiteIncludePaths {
    return @(
        "index.html",
        "favicon.ico",
        "games",
        "samples",
        "src",
        "tools"
    )
}

function Get-DockerArtifactContent {
    param(
        [int]$WebPort = 8080
    )

    return [ordered]@{
        Dockerfile = @(
            "FROM nginx:alpine",
            "COPY site/ /usr/share/nginx/html/",
            "EXPOSE 80",
            'CMD ["nginx", "-g", "daemon off;"]'
        ) -join [Environment]::NewLine
        Compose = @(
            'services:',
            '  web:',
            '    build: .',
            '    ports:',
            "      - `"`${DEPLOY_WEB_PORT:-$WebPort}:80`"",
            '    restart: unless-stopped'
        ) -join [Environment]::NewLine
        DockerIgnore = @(
            "meta/",
            "*.log"
        ) -join [Environment]::NewLine
    }
}

function Write-DockerDeploymentArtifacts {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Paths,
        [int]$WebPort = 8080
    )

    $docker = Get-DockerArtifactContent -WebPort $WebPort
    [System.IO.File]::WriteAllText($Paths.dockerfilePath, $docker.Dockerfile + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText($Paths.composePath, $docker.Compose + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText($Paths.dockerIgnorePath, $docker.DockerIgnore + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
}

function Assert-DockerArtifactReadiness {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Paths
    )

    $requiredArtifacts = @(
        @{ path = $Paths.dockerfilePath; expectedToken = "FROM nginx:alpine" },
        @{ path = $Paths.composePath; expectedToken = "services:" },
        @{ path = $Paths.dockerIgnorePath; expectedToken = "meta/" }
    )

    foreach ($artifact in $requiredArtifacts) {
        if (-not (Test-Path -LiteralPath $artifact.path)) {
            throw "Docker readiness check failed. Missing artifact: $($artifact.path)"
        }

        $content = Get-Content -LiteralPath $artifact.path -Raw -Encoding UTF8
        if ($content.IndexOf($artifact.expectedToken, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
            throw "Docker readiness check failed. Artifact '$($artifact.path)' is missing expected token '$($artifact.expectedToken)'."
        }
    }
}
