param(
  [string]$OutputPath = "dev/docs_build/dev/reports/dead_utils_audit.csv",
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

function Add-ScanFiles {
  param(
    [Parameter(Mandatory = $true)]$Set,
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string[]]$Extensions,
    [Parameter(Mandatory = $true)][string]$ExcludeRegex
  )

  if (-not (Test-Path -LiteralPath $Root)) {
    return
  }

  $files = Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notmatch $ExcludeRegex -and $Extensions -contains $_.Extension.ToLowerInvariant()
    }

  foreach ($file in $files) {
    [void]$Set.Add([System.IO.Path]::GetFullPath($file.FullName))
  }
}

$repoRoot = (Get-Location).Path

$utilityRoots = @(@(
  "src/shared/utils",
  "src/engine/utils"
) | Where-Object { Test-Path -LiteralPath $_ })

if ($utilityRoots.Count -eq 0) {
  throw "No utility roots found. Run from repo root where src/shared/utils exists."
}

$excludeRegex = '[\\/](\\.git|node_modules|tmp|docs[\\/]dev[\\/]reports|dist|build|coverage|\\.cache|\\.next|zip_extract)[\\/]'

$utilityFiles = @()
foreach ($utilityRoot in $utilityRoots) {
  $utilityFiles += Get-ChildItem -LiteralPath $utilityRoot -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notmatch $excludeRegex -and @('.js', '.mjs', '.cjs') -contains $_.Extension.ToLowerInvariant()
    }
}

$scanFilesSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

foreach ($root in @("src", "samples", "tools", "games")) {
  Add-ScanFiles -Set $scanFilesSet -Root $root -Extensions @('.js', '.mjs', '.cjs') -ExcludeRegex $excludeRegex
}

Add-ScanFiles -Set $scanFilesSet -Root "." -Extensions @('.html', '.json') -ExcludeRegex $excludeRegex

$scanFiles = @($scanFilesSet | Sort-Object)

$fileTextMap = @{}
foreach ($path in $scanFiles) {
  try {
    $fileTextMap[$path] = Get-Content -Raw -LiteralPath $path
  } catch {
    $fileTextMap[$path] = ""
  }
}

$rows = New-Object System.Collections.Generic.List[object]
$potentialDead = New-Object System.Collections.Generic.List[object]
$staleRefs = New-Object System.Collections.Generic.List[object]

foreach ($utilityFile in $utilityFiles) {
  $fullPath = [System.IO.Path]::GetFullPath($utilityFile.FullName)
  $relPath = Get-RelativePath -BasePath $repoRoot -TargetPath $fullPath
  $baseName = $utilityFile.Name
  $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($baseName)

  $patterns = @(
    "shared/utils/$baseName",
    "shared/utils/$moduleName",
    "/src/shared/utils/$baseName",
    "/src/shared/utils/$moduleName",
    "engine/utils/$baseName",
    "engine/utils/$moduleName",
    "/src/engine/utils/$baseName",
    "/src/engine/utils/$moduleName"
  )

  $referenceHits = New-Object System.Collections.Generic.HashSet[string]([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($scanPath in $scanFiles) {
    if ([System.IO.Path]::GetFullPath($scanPath) -eq $fullPath) {
      continue
    }

    $content = $fileTextMap[$scanPath]
    foreach ($pattern in $patterns) {
      if ($content.Contains($pattern)) {
        [void]$referenceHits.Add($scanPath)
        break
      }
    }
  }

  $referenceCount = $referenceHits.Count
  $reason = if ($referenceCount -eq 0) { "No matching shared/engine utils path references found in configured scan roots." } else { "Reference pattern matched in configured scan roots." }
  $recommendation = if ($referenceCount -eq 0) { "ReviewForRemoval" } else { "Keep" }

  $rows.Add([pscustomobject]@{
    Kind = "UtilityFile"
    Path = $relPath
    Reason = $reason
    ReferenceCount = $referenceCount
    Recommendation = $recommendation
  })

  if ($referenceCount -eq 0) {
    $candidate = [pscustomobject]@{
      Kind = "PotentialDeadUtility"
      Path = $relPath
      Reason = "No matching reference patterns found in src/samples/tools/games JS or repo HTML/JSON scan."
      ReferenceCount = 0
      Recommendation = "AuditAndConfirmBeforeDelete"
    }
    $rows.Add($candidate)
    $potentialDead.Add($candidate)
  }
}

$stalePatterns = @('src/engine/utils/', '/src/engine/utils/')
foreach ($scanPath in $scanFiles) {
  $content = $fileTextMap[$scanPath]
  foreach ($stalePattern in $stalePatterns) {
    if ($content.Contains($stalePattern)) {
      $relScanPath = Get-RelativePath -BasePath $repoRoot -TargetPath $scanPath
      $staleRow = [pscustomobject]@{
        Kind = "RemainingEngineUtilsReference"
        Path = $relScanPath
        Reason = "Contains stale path fragment '$stalePattern'."
        ReferenceCount = 1
        Recommendation = "RewriteToSharedUtilsPath"
      }
      $rows.Add($staleRow)
      $staleRefs.Add($staleRow)
      break
    }
  }
}

$outputFull = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $OutputPath))
$outputDir = Split-Path -Parent $outputFull
if ($outputDir -and -not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$rows | Sort-Object Kind, Path | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $outputFull

Write-Host "Dead utils audit complete."
Write-Host "Utility files scanned: $($utilityFiles.Count)"
Write-Host "Potential dead utility files: $($potentialDead.Count)"
Write-Host "Remaining engine-utils path references: $($staleRefs.Count)"
Write-Host "Report: $OutputPath"

if ($Details) {
  Write-Host ""
  Write-Host "Potential dead utility files:"
  if ($potentialDead.Count -eq 0) {
    Write-Host "- none"
  } else {
    foreach ($row in ($potentialDead | Sort-Object Path)) {
      Write-Host "- $($row.Path)"
    }
  }

  Write-Host ""
  Write-Host "Remaining engine-utils path references:"
  if ($staleRefs.Count -eq 0) {
    Write-Host "- none"
  } else {
    foreach ($row in ($staleRefs | Sort-Object Path -Unique)) {
      Write-Host "- $($row.Path)"
    }
  }
}

if ($Ci) {
  if ($staleRefs.Count -gt 0) {
    exit 1
  }
  exit 0
}
