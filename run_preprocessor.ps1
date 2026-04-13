param(
    [Parameter(Mandatory = $true)][string]$PrName,
    [switch]$StripSingleLineComments
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$pre = Join-Path $projectRoot "scripts\PS\CodexPreprocessor.ps1"

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

$tmp = Join-Path $projectRoot "tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$zip = Join-Path $tmp ($PrName + ".zip")
if (Test-Path $zip) { Remove-Item $zip -Force }

Compress-Archive -Path (Join-Path $projectRoot ($PrName + "\*")) -DestinationPath $zip -Force

Write-Host "ZIP:" $zip
