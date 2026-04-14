# Codex Website Repo Deployment Scripting

Use these scripts from `scripts/PS/deploy/` to stage repo content for website deployment with safe defaults and Docker compatibility artifacts.

## Scripts
- `scripts/PS/deploy/Prep-WebsiteRepoDeployment.ps1`
- `scripts/PS/deploy/Update-WebsiteRepoDeployment.ps1`
- `scripts/PS/deploy/Clean-WebsiteRepoDeployment.ps1`

## Safety Defaults
- All scripts default to dry-run mode.
- No files are written or deleted unless `-Apply` is provided.
- `-DryRun` is available explicitly on each script.
- Clean operations are restricted to staging paths under `<repo>/tmp`.

## Typical Flow
Prepare staging plan and Docker artifacts:

```powershell
.\scripts\PS\deploy\Prep-WebsiteRepoDeployment.ps1 -Apply
```

Update staged website content:

```powershell
.\scripts\PS\deploy\Update-WebsiteRepoDeployment.ps1 -Apply
```

Clean staged site output only:

```powershell
.\scripts\PS\deploy\Clean-WebsiteRepoDeployment.ps1 -Apply
```

Clean staged site output plus metadata and Docker files:

```powershell
.\scripts\PS\deploy\Clean-WebsiteRepoDeployment.ps1 -RemoveMetadata -Apply
```

## Outputs
- default staging root: `tmp/website-deploy/`
- staged content root: `tmp/website-deploy/site/`
- metadata root: `tmp/website-deploy/meta/`
  - `website-deploy-plan.json`
  - `website-deploy-last-update.json`
- docker compatibility files in `tmp/website-deploy/`
  - `Dockerfile`
  - `docker-compose.yml`
  - `.dockerignore`
