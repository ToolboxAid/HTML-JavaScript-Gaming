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

if ($Json.IsPresent) {
    & $validatorPath -Json
}
else {
    & $validatorPath
}
