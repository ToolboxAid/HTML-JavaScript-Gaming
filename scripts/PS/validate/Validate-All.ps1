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

try {
    $global:LASTEXITCODE = 0
    if ($Json.IsPresent) {
        & $validatorPath -Json
    }
    else {
        & $validatorPath
    }
}
catch {
    Write-Host "Validate-All summary: FAIL"
    Write-Host "Reason: $($_.Exception.Message)"
    exit 1
}

$validatorExitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
$summary = if ($validatorExitCode -eq 0) { "PASS" } else { "FAIL" }
if (-not $Json.IsPresent) {
    Write-Host "Validate-All summary: $summary"
}

if ($validatorExitCode -ne 0) {
    exit $validatorExitCode
}

exit 0
