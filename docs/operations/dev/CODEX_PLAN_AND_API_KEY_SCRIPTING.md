# Codex Plan And API Key Scripting

This repo includes a focused operator scripting surface in `scripts/PS/codex` for:
- switching active Codex billing/plan workflow mode
- setting/updating local API key configuration
- validating API key readiness safely

## Scripts
- `scripts/PS/codex/Switch-CodexPlanMode.ps1`
- `scripts/PS/codex/Set-CodexApiKey.ps1`
- `scripts/PS/codex/Validate-CodexApiKey.ps1`
- `scripts/PS/codex/Get-CodexOperatorState.ps1`

## State File
- Default state file: `.codex/local/codex-operator-state.json`
- Purpose: stores operator metadata only (mode and API key fingerprint)
- Raw API key is not written to disk by these scripts

## Usage
Switch to Pay-as-you-go mode:

```powershell
.\scripts\PS\codex\Switch-CodexPlanMode.ps1 -Mode payg -DryRun
```

Switch to Codex mode:

```powershell
.\scripts\PS\codex\Switch-CodexPlanMode.ps1 -Mode codex
```

Set or update API key for current process only (safe for smoke checks):

```powershell
.\scripts\PS\codex\Set-CodexApiKey.ps1 -ApiKey "sk-your-key" -Scope Process -DryRun
```

Set or update API key for current user profile:

```powershell
.\scripts\PS\codex\Set-CodexApiKey.ps1 -Scope User
```

Validate configured key state:

```powershell
.\scripts\PS\codex\Validate-CodexApiKey.ps1 -EnvVarName OPENAI_API_KEY -RequireStateRecord -DryRun
```

Inspect current mode + metadata:

```powershell
.\scripts\PS\codex\Get-CodexOperatorState.ps1
```

## Guardrails
- Use `-Scope Process` for temporary sessions and script smoke checks.
- Use `-Scope User` only when you intentionally want persistent user configuration.
- Use `-DryRun` first for switch/set/validate/get scripts before applying persistent updates.
- Validation checks local readiness and metadata consistency without printing raw secrets.
- Keep the state file local to the repo; do not commit generated secret material.
