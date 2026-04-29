param(
  [string]$SamplesRoot = "$PSScriptRoot\..\..\samples",
  [string]$OutputPath = "docs/dev/reports/sample_json_js_reference_audit.csv",
  [switch]$FailOnMissing
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RelativePath {
  param($BasePath, $TargetPath)

  $base = [System.IO.Path]::GetFullPath($BasePath)
  $target = [System.IO.Path]::GetFullPath($TargetPath)

  if (-not $base.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
    $base += [System.IO.Path]::DirectorySeparatorChar
  }

  $baseUri = [System.Uri]::new($base)
  $targetUri = [System.Uri]::new($target)

  return [System.Uri]::UnescapeDataString(
    $baseUri.MakeRelativeUri($targetUri).ToString().Replace("/", "\")
  )
}

function Get-SampleRootForFile {
  param($SamplesRootFull, $FileFullName)

  $relative = Get-RelativePath $SamplesRootFull $FileFullName
  $parts = $relative -split '[\\/]+' 

  if ($parts.Count -lt 2) { return $null }

  return Join-Path $SamplesRootFull (Join-Path $parts[0] $parts[1])
}

function Test-JsonReferenceInJs {
  param($JsonFile, $JsFiles, $SampleRoot)

  $jsonRelative = Get-RelativePath $SampleRoot $JsonFile.FullName
  $jsonForward = $jsonRelative.Replace("\","/")
  $jsonName = $JsonFile.Name
  $jsonBase = [System.IO.Path]::GetFileNameWithoutExtension($JsonFile.Name)

  $tokens = @(
    [regex]::Escape($jsonRelative),
    [regex]::Escape($jsonForward),
    [regex]::Escape($jsonName),
    [regex]::Escape($jsonBase)
  ) | Select-Object -Unique

  foreach ($js in $JsFiles) {
    $content = Get-Content -Raw -LiteralPath $js.FullName

    foreach ($token in $tokens) {
      if ($content -match $token) {
        return $true
      }
    }
  }

  return $false
}

# Resolve paths
$samplesRootFull = [System.IO.Path]::GetFullPath($SamplesRoot)

if (-not (Test-Path $samplesRootFull)) {
  throw "Samples root not found: $samplesRootFull"
}

# Get JSON files
$jsonFiles = Get-ChildItem $samplesRootFull -Recurse -File -Filter "*.json"

$results = @()

foreach ($json in $jsonFiles) {
  $sampleRoot = Get-SampleRootForFile $samplesRootFull $json.FullName

  if (-not $sampleRoot) {
    $results += [pscustomobject]@{
      JsonPath = $json.FullName
      Referenced = $false
    }
    continue
  }

  $jsFiles = Get-ChildItem $sampleRoot -Recurse -File -Include "*.js","*.mjs","*.cjs"

  $isUsed = Test-JsonReferenceInJs $json $jsFiles $sampleRoot

  $results += [pscustomobject]@{
    JsonPath = Get-RelativePath (Get-Location) $json.FullName
    Referenced = $isUsed
  }
}

# Output
$used = $results | Where-Object { $_.Referenced }
$missing = $results | Where-Object { -not $_.Referenced }

Write-Host "Sample JSON reference audit complete."
Write-Host "JSON files scanned: $($results.Count)"
Write-Host "Referenced: $($used.Count)"
Write-Host "Missing reference: $($missing.Count)"
Write-Host ""

$results | Sort-Object JsonPath | ForEach-Object {
  if ($_.Referenced) {
    Write-Host "Yes - $($_.JsonPath)"
  } else {
    Write-Host "NO - $($_.JsonPath)"
  }
}

if ($FailOnMissing -and $missing.Count -gt 0) {
  exit 1
}