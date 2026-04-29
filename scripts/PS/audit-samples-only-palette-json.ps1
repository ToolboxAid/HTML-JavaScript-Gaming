<#
.SYNOPSIS
  Recursively audits samples/** and reports sample folders where the only JSON files are palette JSON files.

.DESCRIPTION
  A palette-only sample folder is a leaf sample directory under samples/** that contains one or more *.json files,
  and every JSON file in that folder matches *.palette.json.

  Output:
    - path for each palette-only sample folder
    - JSON count for that folder
    - total count at the end

.PARAMETER SamplesRoot
  Root samples directory. Defaults to "samples" relative to the current repo root.

.PARAMETER CsvPath
  Optional CSV output path. Defaults to docs/dev/reports/samples_only_palette_json_audit.csv.
#>

param(
    [string]$SamplesRoot = "samples",
    [string]$CsvPath = "docs/dev/reports/samples_only_palette_json_audit.csv"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SamplesRoot -PathType Container)) {
    throw "Samples root not found: $SamplesRoot"
}

$results = New-Object System.Collections.Generic.List[object]

$sampleDirs = Get-ChildItem -LiteralPath $SamplesRoot -Recurse -Directory | Where-Object {
    (Get-ChildItem -LiteralPath $_.FullName -Directory -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0
}

foreach ($dir in $sampleDirs) {
    $jsonFiles = @(Get-ChildItem -LiteralPath $dir.FullName -Filter "*.json" -File -ErrorAction SilentlyContinue)

    if ($jsonFiles.Count -eq 0) {
        continue
    }

    $nonPaletteFiles = @($jsonFiles | Where-Object { $_.Name -notmatch '\.palette\.json$' })

    if ($nonPaletteFiles.Count -eq 0) {
        $relativePath = Resolve-Path -LiteralPath $dir.FullName -Relative
        $results.Add([PSCustomObject]@{
            Path = $relativePath
            JsonCount = $jsonFiles.Count
        }) | Out-Null
    }
}

Write-Output "Palette-only sample folders:"

foreach ($result in $results) {
    Write-Output ("{0} - {1} json file(s)" -f $result.Path, $result.JsonCount)
}

Write-Output "----------------------------------------"
Write-Output ("Total palette-only samples: {0}" -f $results.Count)

$csvDir = Split-Path -Parent $CsvPath
if ($csvDir -and -not (Test-Path -LiteralPath $csvDir -PathType Container)) {
    New-Item -ItemType Directory -Path $csvDir -Force | Out-Null
}

$results | Export-Csv -LiteralPath $CsvPath -NoTypeInformation
Write-Output ("Report: {0}" -f $CsvPath)
