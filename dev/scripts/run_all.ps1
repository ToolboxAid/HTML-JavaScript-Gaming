param(
    [Parameter(Mandatory = $true)][string]$PrName,
    [switch]$StripSingleLineComments
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$scriptRoot = Split-Path -Parent $PSCommandPath

Write-Host "STEP 1: Preprocess"
& (Join-Path $scriptRoot "run_preprocessor.ps1") -PrName $PrName -StripSingleLineComments:$StripSingleLineComments

if ($LASTEXITCODE -ne 0) {
    throw "Preprocess failed"
}

Write-Host "STEP 2: Ready for Codex"
Write-Host "Payload:" (Join-Path $projectRoot "dev\workspace\artifacts\zips\$PrName.zip")

Write-Host ""
Write-Host "👉 Next: Feed this ZIP to Codex using your standard command"
