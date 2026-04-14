[CmdletBinding()]
param(
    [switch]$Json
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$validatorPath = Join-Path $PSScriptRoot "Validate-ScriptStructure.ps1"
if (-not (Test-Path -LiteralPath $validatorPath)) {
    throw "Missing validation entrypoint: $validatorPath"
}

$global:LASTEXITCODE = 0
if ($Json.IsPresent) {
    & $validatorPath -Json
}
else {
    & $validatorPath
}

$validatorExitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
$summary = if ($validatorExitCode -eq 0) { "PASS" } else { "FAIL" }
Write-Host "Validate-All summary: $summary"

if ($validatorExitCode -ne 0) {
    exit $validatorExitCode
}
