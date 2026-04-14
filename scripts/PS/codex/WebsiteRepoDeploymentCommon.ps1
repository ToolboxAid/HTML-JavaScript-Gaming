Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-CodexRepoRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
}

function Resolve-WebsiteStagingRoot {
    param(
        [string]$StagingRoot
    )

    if ([string]::IsNullOrWhiteSpace($StagingRoot)) {
        return [System.IO.Path]::GetFullPath((Join-Path (Get-CodexRepoRoot) "tmp\website-deploy"))
    }

    return [System.IO.Path]::GetFullPath($StagingRoot)
}

function Get-WebsiteDeploymentPaths {
    param(
        [Parameter(Mandatory = $true)]
        [string]$StagingRoot
    )

    $resolvedStagingRoot = Resolve-WebsiteStagingRoot -StagingRoot $StagingRoot
    return [ordered]@{
        stagingRoot = $resolvedStagingRoot
        siteRoot = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "site"))
        metaRoot = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta"))
        planPath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta\website-deploy-plan.json"))
        updateReportPath = [System.IO.Path]::GetFullPath((Join-Path $resolvedStagingRoot "meta\website-deploy-last-update.json"))
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
