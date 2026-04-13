param(
    [Parameter(Mandatory = $true)][string]$PrName,
    [switch]$StripSingleLineComments
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$pre = Join-Path $projectRoot "scripts\PS\CodexPreprocessor.ps1"

if (!(Test-Path -LiteralPath $pre)) {
    throw "Missing scripts\PS\CodexPreprocessor.ps1"
}

Write-Host "Running PR:" $PrName

$argList = @(
    "-ExecutionPolicy", "Bypass",
    "-File", $pre,
    "-ProjectFolder", $projectRoot,
    "-Task", $PrName
)

if ($StripSingleLineComments) {
    $argList += "-StripSingleLineComments"
}

& powershell @argList

if ($LASTEXITCODE -ne 0) {
    throw "Preprocessor failed with exit code $LASTEXITCODE"
}

$taskFolder = Join-Path $projectRoot $PrName
if (!(Test-Path -LiteralPath $taskFolder)) {
    throw "Expected output folder was not created: $taskFolder"
}

$tmp = Join-Path $projectRoot "tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$zip = Join-Path $tmp ($PrName + ".zip")
if (Test-Path -LiteralPath $zip) {
    Remove-Item -LiteralPath $zip -Force
}

Compress-Archive -Path (Join-Path $taskFolder "*") -DestinationPath $zip -Force

Write-Host "ZIP:" $zip