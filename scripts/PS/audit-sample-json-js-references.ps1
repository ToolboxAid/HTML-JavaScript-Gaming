param(
  [string]$SamplesRoot = "samples",
  [string]$OutputPath = "docs/dev/reports/sample_json_js_reference_audit.csv",
  [switch]$FailOnMissing
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RelativePath {
  param(
    [Parameter(Mandatory=$true)][string]$BasePath,
    [Parameter(Mandatory=$true)][string]$TargetPath
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
    [Parameter(Mandatory=$true)][string]$SamplesRootFull,
    [Parameter(Mandatory=$true)][string]$FileFullName
  )

  $relative = Get-RelativePath -BasePath $SamplesRootFull -TargetPath $FileFullName
  $parts = $relative -split '[\\/]+'

  if ($parts.Count -lt 2) {
    return $null
  }

  # samples/<group>/<sample>/...
  # Example: samples/19/1902/...
  return Join-Path $SamplesRootFull (Join-Path $parts[0] $parts[1])
}

function Test-JsonReferenceInJs {
  param(
    [Parameter(Mandatory=$true)][System.IO.FileInfo]$JsonFile,
    [Parameter(Mandatory=$true)][System.IO.FileInfo[]]$JsFiles,
    [Parameter(Mandatory=$true)][string]$SampleRoot
  )

  $jsonRelativeToSample = Get-RelativePath -BasePath $SampleRoot -TargetPath $JsonFile.FullName
  $jsonRelativeForward = $jsonRelativeToSample.Replace("\", "/")
  $jsonName = $JsonFile.Name
  $jsonBaseName = [System.IO.Path]::GetFileNameWithoutExtension($JsonFile.Name)

  $tokens = @(
    [regex]::Escape($jsonRelativeToSample),
    [regex]::Escape($jsonRelativeForward),
    [regex]::Escape("./$jsonRelativeForward"),
    [regex]::Escape($jsonName),
    [regex]::Escape($jsonBaseName)
  ) | Select-Object -Unique

  foreach ($js in $JsFiles) {
    $content = Get-Content -Raw -LiteralPath $js.FullName

    foreach ($token in $tokens) {
      if ($content -match $token) {
        return [pscustomobject]@{
          Referenced = $true
          ReferencedBy = Get-RelativePath -BasePath $SampleRoot -TargetPath $js.FullName
          Match = $token
        }
      }
    }
  }

  return [pscustomobject]@{
    Referenced = $false
    ReferencedBy = ""
    Match = ""
  }
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

foreach ($json in $jsonFiles) {
  $sampleRoot = Get-SampleRootForFile -SamplesRootFull $samplesRootFull -FileFullName $json.FullName

  if (-not $sampleRoot -or -not (Test-Path -LiteralPath $sampleRoot)) {
    $rows.Add([pscustomobject]@{
      SampleRoot = ""
      JsonPath = Get-RelativePath -BasePath (Get-Location).Path -TargetPath $json.FullName
      Referenced = $false
      ReferencedBy = ""
      Match = ""
      Note = "Unable to resolve sample root"
    })
    continue
  }

  $jsFiles = @(Get-ChildItem -LiteralPath $sampleRoot -Recurse -File -Include "*.js","*.mjs","*.cjs" |
    Where-Object { $_.FullName -notmatch '[\\/](node_modules|dist|build|coverage)[\\/]' })

  $result = Test-JsonReferenceInJs -JsonFile $json -JsFiles $jsFiles -SampleRoot $sampleRoot

  $rows.Add([pscustomobject]@{
    SampleRoot = Get-RelativePath -BasePath (Get-Location).Path -TargetPath $sampleRoot
    JsonPath = Get-RelativePath -BasePath (Get-Location).Path -TargetPath $json.FullName
    Referenced = $result.Referenced
    ReferencedBy = $result.ReferencedBy
    Match = $result.Match
    Note = if ($jsFiles.Count -eq 0) { "No JS files found under sample root" } else { "" }
  })
}

$rows | Sort-Object SampleRoot, JsonPath | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $outputFull

$missing = @($rows | Where-Object { -not $_.Referenced })

Write-Host "Sample JSON reference audit complete."
Write-Host "JSON files scanned: $($rows.Count)"
Write-Host "Referenced: $($rows.Count - $missing.Count)"
Write-Host "Missing reference: $($missing.Count)"
Write-Host "Report: $OutputPath"

if ($missing.Count -gt 0) {
  Write-Host ""
  Write-Host "Missing references:"
  $missing | ForEach-Object {
    Write-Host "- $($_.JsonPath)"
  }
}

if ($FailOnMissing -and $missing.Count -gt 0) {
  exit 1
}
