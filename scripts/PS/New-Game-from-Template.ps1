[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "Medium")]
param(
    [Parameter(Mandatory = $true)]
    [string]$GameId,
    [string]$DisplayName,
    [string]$GamesRoot,
    [string]$TemplatePath,
    [switch]$Apply,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-ScriptRepoRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
}

function ConvertTo-TemplateSlug {
    param(
        [string]$Value,
        [string]$Fallback
    )

    $source = ""
    if ($null -ne $Value) {
        $source = [string]$Value
    }
    $text = $source.ToLowerInvariant()
    $text = [System.Text.RegularExpressions.Regex]::Replace($text, "[^a-z0-9._-]+", "-")
    $text = [System.Text.RegularExpressions.Regex]::Replace($text, "-{2,}", "-")
    $text = $text.Trim("-")
    if ([string]::IsNullOrWhiteSpace($text)) {
        return $Fallback
    }
    return $text
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

function Ensure-File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $parent = Split-Path -Path $Path -Parent
    Ensure-Directory -Path $parent
    if (-not (Test-Path -LiteralPath $Path)) {
        [System.IO.File]::WriteAllText($Path, "", [System.Text.Encoding]::UTF8)
    }
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

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Value,
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $json = $Value | ConvertTo-Json -Depth 20
    [System.IO.File]::WriteAllText($Path, $json + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
}

function New-EmptyAssetRefs {
    return [ordered]@{
        assetIds = @()
        paletteIds = @()
        spriteIds = @()
        vectorIds = @()
        tilesetIds = @()
        tilemapIds = @()
        imageIds = @()
        parallaxSourceIds = @()
    }
}

function New-ToolIntegrationEntry {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ToolId,
        [Parameter(Mandatory = $true)]
        [string]$ContractId
    )

    return [ordered]@{
        toolId = $ToolId
        contractId = $ContractId
        contractVersion = 1
        contractStatus = "valid"
        contractIssues = @()
        assetReferences = New-EmptyAssetRefs
    }
}

$repoRoot = Get-ScriptRepoRoot
$normalizedGameId = ConvertTo-TemplateSlug -Value $GameId -Fallback "new-game"

if ($Apply.IsPresent -and $DryRun.IsPresent) {
    throw "Use either -Apply or -DryRun, not both."
}

if ($normalizedGameId -ne $GameId) {
    Write-Host "Normalized game id: $normalizedGameId"
}

if ([string]::IsNullOrWhiteSpace($DisplayName)) {
    $DisplayName = ($normalizedGameId -replace "[-_]+", " ").Trim()
    if ([string]::IsNullOrWhiteSpace($DisplayName)) {
        $DisplayName = "New Game"
    }
}

if ([string]::IsNullOrWhiteSpace($GamesRoot)) {
    $GamesRoot = Join-Path $repoRoot "games"
}
else {
    $GamesRoot = [System.IO.Path]::GetFullPath($GamesRoot)
}
if (-not (Test-PathWithinRoot -Path $GamesRoot -RootPath $repoRoot)) {
    throw "Games root must remain within repo root: $GamesRoot"
}

if ([string]::IsNullOrWhiteSpace($TemplatePath)) {
    $TemplatePath = Join-Path $GamesRoot "_template"
}
else {
    $TemplatePath = [System.IO.Path]::GetFullPath($TemplatePath)
}
if (-not (Test-PathWithinRoot -Path $TemplatePath -RootPath $repoRoot)) {
    throw "Template path must remain within repo root: $TemplatePath"
}

if (-not (Test-Path -LiteralPath $TemplatePath)) {
    throw "Template path not found: $TemplatePath"
}

$targetGamePath = Join-Path $GamesRoot $normalizedGameId
if (Test-Path -LiteralPath $targetGamePath) {
    throw "Target game path already exists: $targetGamePath"
}
if (-not (Test-PathWithinRoot -Path $targetGamePath -RootPath $GamesRoot)) {
    throw "Target game path must remain within games root: $targetGamePath"
}

if (-not $Apply.IsPresent -or $DryRun.IsPresent) {
    Write-Host "Dry-run only. No files were created."
    Write-Host "Run with -Apply to create the game scaffold."
    Write-Host "Template source: $TemplatePath"
    Write-Host "Target game path: $targetGamePath"
    exit 0
}

if (-not $PSCmdlet.ShouldProcess($targetGamePath, "Create template game scaffold")) {
    Write-Host "Game scaffold creation cancelled."
    exit 0
}

Ensure-Directory -Path $GamesRoot
Ensure-Directory -Path $targetGamePath

Get-ChildItem -LiteralPath $TemplatePath -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $targetGamePath -Recurse -Force
}

$assetsRoot = Join-Path $targetGamePath "assets"
Ensure-Directory -Path $assetsRoot

$domains = @("sprites", "tilemaps", "parallax", "vectors")
foreach ($domain in $domains) {
    $runtimePath = Join-Path $assetsRoot $domain
    $toolDataPath = Join-Path $runtimePath "data"
    Ensure-Directory -Path $runtimePath
    Ensure-Directory -Path $toolDataPath
    Ensure-File -Path (Join-Path $runtimePath ".gitkeep")
    Ensure-File -Path (Join-Path $toolDataPath ".gitkeep")
}

$manifestPath = Join-Path $assetsRoot "tools.manifest.json"
$manifest = [ordered]@{
    schema = "html-js-gaming.game-asset-manifest"
    version = 1
    gameId = $normalizedGameId
    domains = [ordered]@{
        sprites = @()
        tilemaps = @()
        parallax = @()
        vectors = @()
    }
}
Write-JsonFile -Value $manifest -Path $manifestPath

$projectTools = [ordered]@{
    "sprite-editor" = [ordered]@{
        project = [ordered]@{
            assetRefs = @{}
        }
    }
    "tile-map-editor" = [ordered]@{
        documentModel = [ordered]@{
            assetRefs = @{}
        }
    }
    "parallax-editor" = [ordered]@{
        documentModel = [ordered]@{
            assetRefs = @{}
        }
    }
    "vector-map-editor" = @{}
    "vector-asset-studio" = [ordered]@{
        selectedPaletteId = ""
    }
}

$toolIntegrationTools = [ordered]@{
    "sprite-editor" = (New-ToolIntegrationEntry -ToolId "sprite-editor" -ContractId "tool-state.sprite-editor/1")
    "tile-map-editor" = (New-ToolIntegrationEntry -ToolId "tile-map-editor" -ContractId "tool-state.tile-map-editor/1")
    "parallax-editor" = (New-ToolIntegrationEntry -ToolId "parallax-editor" -ContractId "tool-state.parallax-editor/1")
    "vector-map-editor" = (New-ToolIntegrationEntry -ToolId "vector-map-editor" -ContractId "tool-state.vector-map-editor/1")
    "vector-asset-studio" = (New-ToolIntegrationEntry -ToolId "vector-asset-studio" -ContractId "tool-state.vector-asset-studio/1")
}

$timestamp = [DateTime]::UtcNow.ToString("o")
$projectManifest = [ordered]@{
    schema = "html-js-gaming.project"
    version = 1
    id = "$normalizedGameId-project"
    name = "$DisplayName Tool Project"
    createdAt = $timestamp
    updatedAt = $timestamp
    activeToolId = "sprite-editor"
    dirty = $false
    sharedReferences = [ordered]@{
        asset = $null
        palette = $null
    }
    sharedLibrary = [ordered]@{
        assets = @()
        palettes = @()
    }
    tools = $projectTools
    toolIntegration = [ordered]@{
        schema = "html-js-gaming.project-tool-integration"
        version = 1
        tools = $toolIntegrationTools
        assetReferences = New-EmptyAssetRefs
        contractSummary = [ordered]@{
            schema = "html-js-gaming.tool-data-contract"
            version = 1
            status = "valid"
            invalidToolIds = @()
            warningsByTool = @{}
        }
    }
    workspace = [ordered]@{
        lastOpenTool = "sprite-editor"
        notes = "Generated by scripts/PS/New-Game-from-Template.ps1"
    }
    migration = [ordered]@{
        applied = @()
        sourceVersion = 1
    }
}

$configRoot = Join-Path $targetGamePath "config"
Ensure-Directory -Path $configRoot
$projectManifestPath = Join-Path $configRoot "$normalizedGameId.project.json"
Write-JsonFile -Value $projectManifest -Path $projectManifestPath

$requiredPaths = @(
    (Join-Path $assetsRoot "sprites\data"),
    (Join-Path $assetsRoot "tilemaps\data"),
    (Join-Path $assetsRoot "parallax\data"),
    (Join-Path $assetsRoot "vectors\data"),
    $manifestPath,
    $projectManifestPath
)

$missing = @($requiredPaths | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missing.Count -gt 0) {
    throw "Game scaffold failed validation. Missing: $($missing -join ', ')"
}

Write-Host "Created game scaffold: $normalizedGameId"
Write-Host "Template source: $TemplatePath"
Write-Host "Game path: $targetGamePath"
Write-Host "Asset manifest: $manifestPath"
Write-Host "Tool project scaffold: $projectManifestPath"
