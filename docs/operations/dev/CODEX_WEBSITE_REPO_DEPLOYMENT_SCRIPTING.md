# Codex Website Repo Deployment Scripting

This document is the operator handoff for the Docker-based website staging flow under `scripts/PS/deploy/`.

## Script Roles
- `scripts/PS/deploy/Prep-WebsiteRepoDeployment.ps1`
  - prepares staging folders
  - writes plan + docker artifacts
- `scripts/PS/deploy/Update-WebsiteRepoDeployment.ps1`
  - refreshes staged site content
  - runs post-deploy verification by default
  - supports controlled rollback behavior
- `scripts/PS/deploy/Clean-WebsiteRepoDeployment.ps1`
  - removes staged output
  - optionally removes metadata + ops artifacts

## Safety Defaults
- scripts default to dry-run when `-Apply` is not provided
- destructive paths require explicit confirmation (`-ConfirmDestructive`)
- staging is restricted under `<repo>/tmp`
- update verification failures abort by default

## Config Contract
Config precedence is:
1. explicit script parameters
2. `.env` (or `-EnvFilePath`)
3. built-in defaults

Normalized deploy env names:
- `DEPLOY_STAGING_ROOT`
- `DEPLOY_INCLUDE_PATHS`
- `DEPLOY_REMOVE_METADATA`
- `DEPLOY_WEB_PORT`

Legacy aliases are still accepted with warning logs:
- `STAGING_ROOT`, `INCLUDE_PATHS`, `REMOVE_METADATA`, `PORT`

## Full Flow (Quick Start)
1. Validate script structure placement:

```powershell
.\scripts\PS\validate\Validate-ScriptStructure.ps1
```

2. Preview prep plan:

```powershell
.\scripts\PS\deploy\Prep-WebsiteRepoDeployment.ps1 -DryRun
```

3. Apply prep:

```powershell
.\scripts\PS\deploy\Prep-WebsiteRepoDeployment.ps1 -Apply
```

4. Preview update:

```powershell
.\scripts\PS\deploy\Update-WebsiteRepoDeployment.ps1 -DryRun
```

5. Apply update with explicit destructive confirmation:

```powershell
.\scripts\PS\deploy\Update-WebsiteRepoDeployment.ps1 -Apply -ConfirmDestructive
```

6. Preview cleanup:

```powershell
.\scripts\PS\deploy\Clean-WebsiteRepoDeployment.ps1 -DryRun
```

7. Apply cleanup with metadata removal:

```powershell
.\scripts\PS\deploy\Clean-WebsiteRepoDeployment.ps1 -Apply -ConfirmDestructive -RemoveMetadata
```

## Example Using `.env`
Example `tmp/deploy.env`:

```dotenv
DEPLOY_STAGING_ROOT=tmp/website-deploy-ops
DEPLOY_INCLUDE_PATHS=index.html,src,tools
DEPLOY_WEB_PORT=9090
DEPLOY_REMOVE_METADATA=true
```

Use it across all scripts:

```powershell
.\scripts\PS\deploy\Prep-WebsiteRepoDeployment.ps1 -EnvFilePath tmp/deploy.env -Apply
.\scripts\PS\deploy\Update-WebsiteRepoDeployment.ps1 -EnvFilePath tmp/deploy.env -Apply -ConfirmDestructive
.\scripts\PS\deploy\Clean-WebsiteRepoDeployment.ps1 -EnvFilePath tmp/deploy.env -Apply -ConfirmDestructive
```

## Dry-Run + Validation Usage
Dry-run every stage first:

```powershell
.\scripts\PS\deploy\Prep-WebsiteRepoDeployment.ps1 -EnvFilePath tmp/deploy.env -DryRun
.\scripts\PS\deploy\Update-WebsiteRepoDeployment.ps1 -EnvFilePath tmp/deploy.env -DryRun
.\scripts\PS\deploy\Clean-WebsiteRepoDeployment.ps1 -EnvFilePath tmp/deploy.env -DryRun
```

Post-deploy verification output (after update apply):
- `tmp/<staging>/meta/website-deploy-last-verify.json`

Expected quick checks:
- `passed` is `true`
- `failedCheckCount` is `0`
- required include paths exist under staged `site/`

## Monitoring + Ops Artifacts
Deploy scripts emit:
- state file: `meta/website-deploy-ops-state.json`
- event log: `meta/website-deploy-ops-log.jsonl`
- verification report: `meta/website-deploy-last-verify.json`

Use these for operator triage:
- last known stage/status: `website-deploy-ops-state.json`
- chronological events: `website-deploy-ops-log.jsonl`
- verification gate result: `website-deploy-last-verify.json`

## Rollback / Abort Expectations
- default behavior on verification failure:
  - update operation aborts
  - failure details are written to verify report + ops logs
- optional rollback mode:
  - pass `-RollbackOnVerificationFailure`
  - requires `-ConfirmDestructive`
  - rollback uses cleanup of staged artifacts

Example:

```powershell
.\scripts\PS\deploy\Update-WebsiteRepoDeployment.ps1 -Apply -ConfirmDestructive -RollbackOnVerificationFailure
```

Skip verification only when explicitly needed:

```powershell
.\scripts\PS\deploy\Update-WebsiteRepoDeployment.ps1 -Apply -ConfirmDestructive -SkipPostDeployVerification
```

## Output Locations
- default staging root: `tmp/website-deploy/`
- staged site root: `tmp/website-deploy/site/`
- metadata root: `tmp/website-deploy/meta/`
- docker artifacts:
  - `Dockerfile`
  - `docker-compose.yml`
  - `.dockerignore`
