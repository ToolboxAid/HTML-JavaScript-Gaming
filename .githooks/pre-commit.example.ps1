[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$validateAllPath = Join-Path $repoRoot "scripts\PS\validate\Validate-All.ps1"

if (-not (Test-Path -LiteralPath $validateAllPath)) {
    Write-Host "Pre-commit validation: FAIL"
    Write-Host "Reason: Missing validator script at $validateAllPath"
    exit 1
}

& $validateAllPath
$exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }

if ($exitCode -ne 0) {
    Write-Host "Pre-commit validation: FAIL"
    Write-Host "Commit aborted. Fix validation errors before committing."
    exit $exitCode
}

Write-Host "Pre-commit validation: PASS"
exit 0
