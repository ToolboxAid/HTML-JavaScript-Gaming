[CmdletBinding()]
param(
    [switch]$Json
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RepoRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
}

function Get-FileNames {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Directory
    )

    if (-not (Test-Path -LiteralPath $Directory)) {
        return @()
    }

    return @(
        Get-ChildItem -LiteralPath $Directory -File -Filter "*.ps1" -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty Name
    )
}

function New-RoleCheckResult {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Role,
        [Parameter(Mandatory = $true)]
        [string]$Directory,
        [Parameter(Mandatory = $true)]
        [string[]]$ExpectedScripts
    )

    $present = Get-FileNames -Directory $Directory
    $missing = @($ExpectedScripts | Where-Object { $_ -notin $present })
    return [ordered]@{
        role = $Role
        directory = $Directory
        expected = $ExpectedScripts
        present = $present
        missing = $missing
        valid = $missing.Count -eq 0
    }
}

$repoRoot = Get-RepoRoot
$scriptsRoot = Join-Path $repoRoot "scripts\PS"
$codexRoot = Join-Path $scriptsRoot "codex"
$deployRoot = Join-Path $scriptsRoot "deploy"
$validateRoot = Join-Path $scriptsRoot "validate"

$issues = New-Object System.Collections.Generic.List[string]

foreach ($requiredDir in @($scriptsRoot, $codexRoot, $deployRoot, $validateRoot)) {
    if (-not (Test-Path -LiteralPath $requiredDir)) {
        $issues.Add("Missing required script folder: $requiredDir")
    }
}

$generalExpected = @(
    "New-Game-from-Template.ps1"
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

$validateExpected = @(
    "Validate-ScriptStructure.ps1",
    "Validate-All.ps1"
)

$generalResult = New-RoleCheckResult -Role "general" -Directory $scriptsRoot -ExpectedScripts $generalExpected
$codexResult = New-RoleCheckResult -Role "codex" -Directory $codexRoot -ExpectedScripts $codexExpected
$deployResult = New-RoleCheckResult -Role "deploy" -Directory $deployRoot -ExpectedScripts $deployExpected
$validateResult = New-RoleCheckResult -Role "validate" -Directory $validateRoot -ExpectedScripts $validateExpected

foreach ($result in @($generalResult, $codexResult, $deployResult, $validateResult)) {
    foreach ($missingName in $result.missing) {
        $issues.Add("Missing $($result.role) script '$missingName'. Expected in: $($result.directory)")
    }
}

foreach ($misplaced in @(
    (Get-FileNames -Directory $codexRoot | Where-Object { $_ -like "*WebsiteRepoDeployment*" }),
    (Get-FileNames -Directory $codexRoot | Where-Object { $_ -like "Prep-WebsiteRepoDeployment*" -or $_ -like "Update-WebsiteRepoDeployment*" -or $_ -like "Clean-WebsiteRepoDeployment*" })
)) {
    foreach ($name in $misplaced) {
        $issues.Add("Misplaced deployment script '$name' in scripts/PS/codex. Move to scripts/PS/deploy.")
    }
}

foreach ($name in (Get-FileNames -Directory $deployRoot | Where-Object { $_ -like "*Codex*" })) {
    $issues.Add("Misplaced codex script '$name' in scripts/PS/deploy. Move to scripts/PS/codex.")
}

foreach ($name in (Get-FileNames -Directory $scriptsRoot | Where-Object { $_ -like "*Codex*" -or $_ -like "*WebsiteRepoDeployment*" -or $_ -like "Validate-*" })) {
    $issues.Add("Misplaced specialized script '$name' in scripts/PS. Move to scripts/PS/codex, scripts/PS/deploy, or scripts/PS/validate.")
}

foreach ($name in (Get-FileNames -Directory $validateRoot | Where-Object { $_ -notlike "Validate-*" })) {
    $issues.Add("Naming mismatch in scripts/PS/validate: '$name'. Validation scripts should start with 'Validate-'.")
}

$result = [ordered]@{
    schema = "html-js-gaming.script-structure-validation"
    version = 1
    scriptsRoot = $scriptsRoot
    checks = [ordered]@{
        general = $generalResult
        codex = $codexResult
        deploy = $deployResult
        validate = $validateResult
    }
    valid = $issues.Count -eq 0
    issues = @($issues)
}

if ($Json.IsPresent) {
    $result | ConvertTo-Json -Depth 10
}
else {
    $status = if ($result.valid) { "PASS" } else { "FAIL" }
    Write-Host "Script structure validation: $status"
    if (-not $result.valid) {
        foreach ($issue in $result.issues) {
            Write-Host " - $issue"
        }
    }
}

if (-not $result.valid) {
    exit 1
}
