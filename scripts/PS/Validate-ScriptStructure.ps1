[CmdletBinding()]
param(
    [switch]$Json
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RepoRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
}

function Test-ExpectedScripts {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,
        [Parameter(Mandatory = $true)]
        [string[]]$ExpectedNames,
        [Parameter(Mandatory = $true)]
        [string]$Role
    )

    $missing = New-Object System.Collections.Generic.List[string]
    foreach ($name in $ExpectedNames) {
        $full = Join-Path $BasePath $name
        if (-not (Test-Path -LiteralPath $full)) {
            $missing.Add($name)
        }
    }

    return [ordered]@{
        role = $Role
        basePath = $BasePath
        expectedCount = $ExpectedNames.Count
        missing = @($missing)
        valid = $missing.Count -eq 0
    }
}

$repoRoot = Get-RepoRoot
$scriptsRoot = Join-Path $repoRoot "scripts\PS"
$codexRoot = Join-Path $scriptsRoot "codex"
$deployRoot = Join-Path $scriptsRoot "deploy"

$issues = New-Object System.Collections.Generic.List[string]

foreach ($requiredDir in @($scriptsRoot, $codexRoot, $deployRoot)) {
    if (-not (Test-Path -LiteralPath $requiredDir)) {
        $issues.Add("Missing required directory: $requiredDir")
    }
}

$generalExpected = @(
    "New-Game-from-Template.ps1",
    "Validate-ScriptStructure.ps1"
)

$codexExpected = @(
    "CodexOperatorState.ps1",
    "CodexPreprocessor.ps1",
    "Get-CodexOperatorState.ps1",
    "Set-CodexApiKey.ps1",
    "Switch-CodexPlanMode.ps1",
    "Validate-CodexApiKey.ps1"
)

$deployExpected = @(
    "WebsiteRepoDeploymentCommon.ps1",
    "Prep-WebsiteRepoDeployment.ps1",
    "Update-WebsiteRepoDeployment.ps1",
    "Clean-WebsiteRepoDeployment.ps1"
)

$generalResult = Test-ExpectedScripts -BasePath $scriptsRoot -ExpectedNames $generalExpected -Role "general"
$codexResult = Test-ExpectedScripts -BasePath $codexRoot -ExpectedNames $codexExpected -Role "codex"
$deployResult = Test-ExpectedScripts -BasePath $deployRoot -ExpectedNames $deployExpected -Role "deploy"

foreach ($result in @($generalResult, $codexResult, $deployResult)) {
    foreach ($missingName in $result.missing) {
        $issues.Add("Missing $($result.role) script: $missingName")
    }
}

$misplacedDeploy = @(Get-ChildItem -LiteralPath $codexRoot -Filter "*WebsiteRepoDeployment*.ps1" -ErrorAction SilentlyContinue)
foreach ($entry in $misplacedDeploy) {
    $issues.Add("Deployment script is misplaced in codex folder: $($entry.Name)")
}

$misplacedCodex = @(Get-ChildItem -LiteralPath $deployRoot -Filter "*Codex*.ps1" -ErrorAction SilentlyContinue)
foreach ($entry in $misplacedCodex) {
    $issues.Add("Codex script is misplaced in deploy folder: $($entry.Name)")
}

$result = [ordered]@{
    schema = "html-js-gaming.script-structure-validation"
    version = 1
    scriptsRoot = $scriptsRoot
    checks = [ordered]@{
        general = $generalResult
        codex = $codexResult
        deploy = $deployResult
    }
    valid = $issues.Count -eq 0
    issues = @($issues)
}

if ($Json.IsPresent) {
    $result | ConvertTo-Json -Depth 8
}
else {
    $status = if ($result.valid) { "PASS" } else { "FAIL" }
    Write-Host "Script structure validation: $status"
    foreach ($issue in $result.issues) {
        Write-Host " - $issue"
    }
}

if (-not $result.valid) {
    exit 1
}
