param(
    [Parameter(Mandatory = $true)][string]$PrName,
    [switch]$StripSingleLineComments
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$pre = Join-Path $projectRoot "dev\scripts\PS\codex\CodexPreprocessor.ps1"

$argList = @(
    "-ExecutionPolicy","Bypass",
    "-File",$pre,
    "-ProjectFolder",$projectRoot,
    "-Task",$PrName
)

if ($StripSingleLineComments) {
    $argList += "-StripSingleLineComments"
}

& powershell @argList

if ($LASTEXITCODE -ne 0) {
    throw "Preprocessor failed"
}

$zipRoot = Join-Path $projectRoot "dev\workspace\artifacts\zips"
New-Item -ItemType Directory -Force -Path $zipRoot | Out-Null

$zip = Join-Path $zipRoot ($PrName + ".zip")
if (Test-Path $zip) { Remove-Item $zip -Force }

Compress-Archive -Path (Join-Path $projectRoot ($PrName + "\*")) -DestinationPath $zip -Force

Write-Host "ZIP:" $zip
