param(
  [string]$SamplesRoot = "$PSScriptRoot\..\..\samples",
  [string]$OutputPath = "docs_build/dev/reports/sample_json_js_reference_audit.csv",
  [switch]$FailOnMissing,
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

function Get-SampleRootForFile {
  param(
    [Parameter(Mandatory = $true)][string]$SamplesRootFull,
    [Parameter(Mandatory = $true)][string]$FileFullName
  )

  $relative = Get-RelativePath -BasePath $SamplesRootFull -TargetPath $FileFullName
  $parts = $relative -split '[\\/]+'
  if ($parts.Count -lt 2) {
    return $null
  }

  # Handle JSON files directly under a first-level folder (for example samples/metadata/*.json).
  if ($parts.Count -eq 2 -and [System.IO.Path]::GetExtension($parts[1]) -eq '.json') {
    return Join-Path $SamplesRootFull $parts[0]
  }

  return Join-Path $SamplesRootFull (Join-Path $parts[0] $parts[1])
}

function Find-JsonReferencesInJs {
  param(
    [Parameter(Mandatory = $true)][System.IO.FileInfo]$JsonFile,
    [Parameter(Mandatory = $true)][System.IO.FileInfo[]]$JsFiles,
    [Parameter(Mandatory = $true)][string]$SampleRoot
  )

  $jsonRelativeToSample = Get-RelativePath -BasePath $SampleRoot -TargetPath $JsonFile.FullName
  $jsonRelativeForward = $jsonRelativeToSample.Replace("\\", "/")
  $jsonName = $JsonFile.Name
  $jsonBaseName = [System.IO.Path]::GetFileNameWithoutExtension($jsonName)

  $tokens = @(
    [regex]::Escape($jsonRelativeToSample),
    [regex]::Escape($jsonRelativeForward),
    [regex]::Escape("./$jsonRelativeForward"),
    [regex]::Escape($jsonName),
    [regex]::Escape($jsonBaseName)
  ) | Select-Object -Unique

  $referenceList = New-Object System.Collections.Generic.List[object]

  foreach ($js in $JsFiles) {
    $content = Get-Content -Raw -LiteralPath $js.FullName
    foreach ($token in $tokens) {
      if ($content -match $token) {
        $referenceList.Add([pscustomobject]@{
          ReferencedBy = Get-RelativePath -BasePath $SampleRoot -TargetPath $js.FullName
          Match = $token
        })
        break
      }
    }
  }

  $deduped = $referenceList |
    Group-Object -Property ReferencedBy |
    ForEach-Object { $_.Group[0] }

  return @($deduped)
}

if (-not (Test-Path -LiteralPath $SamplesRoot)) {
  throw "Samples root not found: $SamplesRoot"
}

$samplesRootFull = [System.IO.Path]::GetFullPath($SamplesRoot)
$outputFull = [System.IO.Path]::GetFullPath($OutputPath)
$outputDir = Split-Path -Parent $outputFull
if ($outputDir -and -not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

$jsonFiles = Get-ChildItem -LiteralPath $samplesRootFull -Recurse -File -Filter "*.json" |
  Where-Object { $_.FullName -notmatch '[\\/](node_modules|dist|build|coverage)[\\/]' }

$rows = New-Object System.Collections.Generic.List[object]
$missing = New-Object System.Collections.Generic.List[object]

foreach ($json in $jsonFiles) {
  $sampleRoot = Get-SampleRootForFile -SamplesRootFull $samplesRootFull -FileFullName $json.FullName
  $jsonRelFromCwd = Get-RelativePath -BasePath (Get-Location).Path -TargetPath $json.FullName

  if (-not $sampleRoot -or -not (Test-Path -LiteralPath $sampleRoot)) {
    if ($Details) {
      Write-Host "NO  - $jsonRelFromCwd"
    }
    $rows.Add([pscustomobject]@{
      SampleRoot = ""
      JsonPath = $jsonRelFromCwd
      Referenced = $false
      ReferencedBy = ""
      Match = ""
      Note = "Unable to resolve sample root"
    })
    $missing.Add($jsonRelFromCwd)
    continue
  }

  $jsFiles = @(Get-ChildItem -LiteralPath $sampleRoot -Recurse -File -Include "*.js", "*.mjs", "*.cjs" |
      Where-Object { $_.FullName -notmatch '[\\/](node_modules|dist|build|coverage)[\\/]' })

  $matches = @(Find-JsonReferencesInJs -JsonFile $json -JsFiles $jsFiles -SampleRoot $sampleRoot)

  if ($matches.Count -gt 0) {
    $first = $matches[0]
    if ($Details) {
      Write-Host ("YES - {0} -> {1}" -f $jsonRelFromCwd, $first.ReferencedBy)
    }
    $rows.Add([pscustomobject]@{
      SampleRoot = Get-RelativePath -BasePath (Get-Location).Path -TargetPath $sampleRoot
      JsonPath = $jsonRelFromCwd
      Referenced = $true
      ReferencedBy = $first.ReferencedBy
      Match = $first.Match
      Note = if ($matches.Count -gt 1) { "Multiple JS references found" } else { "" }
    })
  } else {
    if ($Details) {
      Write-Host "NO  - $jsonRelFromCwd"
    }
    $rows.Add([pscustomobject]@{
      SampleRoot = Get-RelativePath -BasePath (Get-Location).Path -TargetPath $sampleRoot
      JsonPath = $jsonRelFromCwd
      Referenced = $false
      ReferencedBy = ""
      Match = ""
      Note = if ($jsFiles.Count -eq 0) { "No JS files found under sample root" } else { "" }
    })
    $missing.Add($jsonRelFromCwd)
  }
}

$rows |
  Sort-Object SampleRoot, JsonPath |
  Export-Csv -NoTypeInformation -Encoding UTF8 -Path $outputFull

Write-Host ""
Write-Host "Sample JSON reference audit complete."
Write-Host "JSON files scanned: $($rows.Count)"
Write-Host "Referenced: $($rows.Count - $missing.Count)"
Write-Host "Missing reference: $($missing.Count)"
Write-Host "Report: $OutputPath"

if (-not $Details) {
  if (($FailOnMissing -or $Ci) -and $missing.Count -gt 0) {
    exit 1
  }
  if ($Ci) {
    exit 0
  }
  return
}

if ($missing.Count -gt 0) {
  Write-Host ""
  Write-Host "Missing references:"
  foreach ($path in $missing) {
    Write-Host "- $path"
  }
}

if (($FailOnMissing -or $Ci) -and $missing.Count -gt 0) {
  exit 1
}

if ($Ci) {
  exit 0
}
