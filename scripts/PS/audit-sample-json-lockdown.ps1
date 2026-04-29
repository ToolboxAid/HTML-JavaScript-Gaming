param(
  [string]$SamplesRoot = "samples",
  [string]$OutputPath = "docs/dev/reports/sample_json_lockdown_audit.csv",
  [switch]$Details,
  [switch]$Ci
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RelativePath {
  param(
    [Parameter(Mandatory = $true)][string]$BasePath,
    [Parameter(Mandatory = $true)][string]$TargetPath
  )

  $base = [System.IO.Path]::GetFullPath($BasePath)
  $target = [System.IO.Path]::GetFullPath($TargetPath)
  if (-not $base.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
    $base += [System.IO.Path]::DirectorySeparatorChar
  }

  $baseUri = [System.Uri]::new($base)
  $targetUri = [System.Uri]::new($target)
  return [System.Uri]::UnescapeDataString(
    $baseUri.MakeRelativeUri($targetUri).ToString().Replace("/", [System.IO.Path]::DirectorySeparatorChar)
  )
}

function Resolve-SampleLeafRoot {
  param(
    [Parameter(Mandatory = $true)][string]$SamplesRootFull,
    [Parameter(Mandatory = $true)][string]$FilePath
  )

  $relative = Get-RelativePath -BasePath $SamplesRootFull -TargetPath $FilePath
  $parts = $relative -split '[\\/]+'
  if ($parts.Count -lt 2) {
    return $null
  }

  if ($parts[0] -match '^phase-\d{2}$' -and $parts[1] -match '^\d{4}$') {
    return Join-Path $SamplesRootFull (Join-Path $parts[0] $parts[1])
  }

  return Join-Path $SamplesRootFull $parts[0]
}

if (-not (Test-Path -LiteralPath $SamplesRoot)) {
  throw "Samples root not found from current directory. Run this script from repo root. Missing path: $SamplesRoot"
}

$samplesRootFull = [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $SamplesRoot))
$outputFull = [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $OutputPath))
$outputDir = Split-Path -Parent $outputFull
if ($outputDir -and -not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$excludePattern = '[\\/](node_modules|dist|build|coverage)[\\/]'

$jsonFiles = @(Get-ChildItem -LiteralPath $samplesRootFull -Recurse -File -Filter '*.json' |
  Where-Object { $_.FullName -notmatch $excludePattern })

$jsFiles = @(Get-ChildItem -LiteralPath $samplesRootFull -Recurse -File -Include '*.js', '*.mjs', '*.cjs' |
  Where-Object { $_.FullName -notmatch $excludePattern })

$jsIndex = New-Object System.Collections.Generic.List[object]
foreach ($js in $jsFiles) {
  $jsIndex.Add([pscustomobject]@{
    FullName = $js.FullName
    Relative = Get-RelativePath -BasePath (Get-Location).Path -TargetPath $js.FullName
    Content  = Get-Content -Raw -LiteralPath $js.FullName
  })
}

$rows = New-Object System.Collections.Generic.List[object]
$missing = New-Object System.Collections.Generic.List[string]
$paletteOnlyFolderMap = @{}

foreach ($json in $jsonFiles) {
  $jsonRel = Get-RelativePath -BasePath (Get-Location).Path -TargetPath $json.FullName
  $jsonName = $json.Name
  $leafRoot = Resolve-SampleLeafRoot -SamplesRootFull $samplesRootFull -FilePath $json.FullName
  $leafRel = if ($leafRoot) { Get-RelativePath -BasePath (Get-Location).Path -TargetPath $leafRoot } else { '' }

  $token = [regex]::Escape($jsonName)
  $matchRecord = $null
  foreach ($js in $jsIndex) {
    if ($js.Content -match $token) {
      $matchRecord = $js
      break
    }
  }

  $isReferenced = $null -ne $matchRecord
  if (-not $isReferenced) {
    $missing.Add($jsonRel)
  }

  $isPalette = $jsonName -like '*.palette.json'

  if ($leafRel -and -not $paletteOnlyFolderMap.ContainsKey($leafRel)) {
    $paletteOnlyFolderMap[$leafRel] = [pscustomobject]@{
      TotalJson = 0
      PaletteJson = 0
    }
  }

  if ($leafRel) {
    $folderState = $paletteOnlyFolderMap[$leafRel]
    $folderState.TotalJson += 1
    if ($isPalette) {
      $folderState.PaletteJson += 1
    }
    $paletteOnlyFolderMap[$leafRel] = $folderState
  }

  $rows.Add([pscustomobject]@{
    SampleLeaf = $leafRel
    JsonPath = $jsonRel
    Referenced = $isReferenced
    ReferencedBy = if ($isReferenced) { $matchRecord.Relative } else { '' }
    IsPaletteJson = $isPalette
  })
}

$paletteOnlyFolders = @(
  $paletteOnlyFolderMap.GetEnumerator() |
  Where-Object { $_.Value.TotalJson -gt 0 -and $_.Value.TotalJson -eq $_.Value.PaletteJson } |
  ForEach-Object { $_.Key } |
  Sort-Object
)

$paletteOnlyLookup = @{}
foreach ($folder in $paletteOnlyFolders) {
  $paletteOnlyLookup[$folder] = $true
}

$rowsWithPaletteInfo = $rows |
  Sort-Object SampleLeaf, JsonPath |
  ForEach-Object {
    [pscustomobject]@{
      SampleLeaf = $_.SampleLeaf
      JsonPath = $_.JsonPath
      Referenced = $_.Referenced
      ReferencedBy = $_.ReferencedBy
      IsPaletteJson = $_.IsPaletteJson
      IsPaletteOnlySampleFolder = $paletteOnlyLookup.ContainsKey($_.SampleLeaf)
    }
  }

$rowsWithPaletteInfo | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $outputFull

$scannedCount = $rowsWithPaletteInfo.Count
$missingCount = $missing.Count
$referencedCount = $scannedCount - $missingCount

Write-Host ""
Write-Host "Sample JSON lockdown audit complete."
Write-Host "JSON files scanned: $scannedCount"
Write-Host "Referenced: $referencedCount"
Write-Host "Missing reference: $missingCount"
Write-Host "Palette-only sample folders: $($paletteOnlyFolders.Count)"
Write-Host "Report: $OutputPath"

if ($Details) {
  Write-Host ""
  Write-Host "Missing references:"
  if ($missingCount -eq 0) {
    Write-Host "- none"
  } else {
    foreach ($path in ($missing | Sort-Object)) {
      Write-Host "- $path"
    }
  }

  Write-Host ""
  Write-Host "Palette-only sample folders:"
  if ($paletteOnlyFolders.Count -eq 0) {
    Write-Host "- none"
  } else {
    foreach ($folder in $paletteOnlyFolders) {
      Write-Host "- $folder"
    }
  }
}

if ($Ci) {
  if ($missingCount -gt 0) {
    exit 1
  }
  exit 0
}
