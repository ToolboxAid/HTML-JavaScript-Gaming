param(
  [switch]$Details,
  [switch]$Ci
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$scriptPath = Join-Path $repoRoot "scripts\validate-json-contracts.mjs"
$args = @($scriptPath, "--mode", "games")
if ($Details) { $args += "--details" }
if ($Ci) { $args += "--ci" }

& node @args
exit $LASTEXITCODE
