<#
.SYNOPSIS
  Enforce utility-folder hygiene for shared vs engine utilities.

.DESCRIPTION
  CI-safe report script for the utility consolidation lane.
  Fails when:
    - src/engine/utils contains JavaScript files
    - references to src/engine/utils remain
    - duplicate utility basenames exist under src/shared/utils
    - shared utility files appear unreferenced outside themselves

.PARAMETER Details
  Prints detailed findings.

.PARAMETER Ci
  Exits 1 when violations are found.
#>

param(
    [switch]$Details,
    [switch]$Ci
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$SharedUtilsRoot = Join-Path $RepoRoot "src\shared\utils"
$EngineUtilsRoot = Join-Path $RepoRoot "src\engine\utils"
$ReportDir = Join-Path $RepoRoot "docs_build\dev\reports"
$CsvPath = Join-Path $ReportDir "utils_rules_audit.csv"

New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null

$Findings = New-Object System.Collections.Generic.List[object]

function Add-Finding {
    param(
        [string]$Type,
        [string]$Path,
        [string]$Detail
    )

    $Findings.Add([PSCustomObject]@{
        Type = $Type
        Path = $Path
        Detail = $Detail
    }) | Out-Null
}

function Get-RepoRelativePath {
    param([string]$Path)
    $resolved = Resolve-Path $Path -ErrorAction SilentlyContinue
    if ($null -eq $resolved) { return $Path }
    return $resolved.Path.Substring($RepoRoot.Path.Length).TrimStart('\','/') -replace '\\','/'
}

$SharedUtils = @()
if (Test-Path $SharedUtilsRoot) {
    $SharedUtils = @(Get-ChildItem -Path $SharedUtilsRoot -Recurse -File -Filter *.js)
}

$EngineUtils = @()
if (Test-Path $EngineUtilsRoot) {
    $EngineUtils = @(Get-ChildItem -Path $EngineUtilsRoot -Recurse -File -Filter *.js)
}

foreach ($file in $EngineUtils) {
    Add-Finding -Type "ENGINE_UTIL_FILE" -Path (Get-RepoRelativePath $file.FullName) -Detail "Utility file remains under src/engine/utils; move to src/shared/utils unless it is proven engine-runtime code."
}

$SourceFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -File -Include *.js,*.mjs,*.html,*.json,*.md -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\.git\\' -and
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\tmp\\' -and
    $_.FullName -notmatch '\\docs\\dev\\reports\\'
})

$EngineUtilReferencePatterns = @(
    "src/engine/utils/",
    "/src/engine/utils/",
    "src\\engine\\utils\\",
    "\\src\\engine\\utils\\"
)

foreach ($pattern in $EngineUtilReferencePatterns) {
    $matches = @($SourceFiles | Select-String -SimpleMatch -Pattern $pattern -ErrorAction SilentlyContinue)
    foreach ($match in $matches) {
        Add-Finding -Type "ENGINE_UTIL_REFERENCE" -Path (Get-RepoRelativePath $match.Path) -Detail "Line $($match.LineNumber): remaining reference to $pattern"
    }
}

$ByBaseName = $SharedUtils | Group-Object BaseName | Where-Object { $_.Count -gt 1 }
foreach ($group in $ByBaseName) {
    $paths = ($group.Group | ForEach-Object { Get-RepoRelativePath $_.FullName }) -join '; '
    Add-Finding -Type "DUPLICATE_SHARED_UTIL_BASENAME" -Path $group.Name -Detail $paths
}

foreach ($file in $SharedUtils) {
    $relative = Get-RepoRelativePath $file.FullName
    $moduleName = $file.BaseName

    $refs = @($SourceFiles | Where-Object { $_.FullName -ne $file.FullName } | Select-String -SimpleMatch -Pattern $moduleName -ErrorAction SilentlyContinue)

    if ($refs.Count -eq 0) {
        Add-Finding -Type "POSSIBLY_DEAD_SHARED_UTIL" -Path $relative -Detail "No references to utility basename found outside the file itself. Review before deleting; dynamic usage may not be detected."
    }
}

$Findings | Export-Csv -Path $CsvPath -NoTypeInformation

Write-Output "Utils rules audit complete."
Write-Output "Shared utility files scanned: $($SharedUtils.Count)"
Write-Output "Engine utility files found: $($EngineUtils.Count)"
Write-Output "Findings: $($Findings.Count)"
Write-Output "Report: docs_build/dev/reports/utils_rules_audit.csv"

if ($Details -and $Findings.Count -gt 0) {
    Write-Output ""
    Write-Output "Details:"
    foreach ($finding in $Findings) {
        Write-Output "$($finding.Type) - $($finding.Path) - $($finding.Detail)"
    }
}

if ($Ci -and $Findings.Count -gt 0) {
    exit 1
}
