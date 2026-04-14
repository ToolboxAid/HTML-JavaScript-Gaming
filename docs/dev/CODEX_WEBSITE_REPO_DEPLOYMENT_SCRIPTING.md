# Codex Website Repo Deployment Scripting

Use these scripts from `scripts/PS/codex/` to stage repo content for website deployment with safe defaults.

## Scripts
- `scripts/PS/codex/Prep-WebsiteRepoDeployment.ps1`
- `scripts/PS/codex/Update-WebsiteRepoDeployment.ps1`
- `scripts/PS/codex/Clean-WebsiteRepoDeployment.ps1`

## Safety Defaults
- All scripts default to preview-only mode.
- No files are written or deleted unless `-Apply` is provided.
- Clean operations are restricted to staging paths under `<repo>/tmp`.

## Typical Flow
Prepare staging plan:

```powershell
.\scripts\PS\codex\Prep-WebsiteRepoDeployment.ps1 -Apply
```

Update staged website content:

```powershell
.\scripts\PS\codex\Update-WebsiteRepoDeployment.ps1 -Apply
```

Clean staged site output only:

```powershell
.\scripts\PS\codex\Clean-WebsiteRepoDeployment.ps1 -Apply
```

Clean staged site output plus metadata files:

```powershell
.\scripts\PS\codex\Clean-WebsiteRepoDeployment.ps1 -RemoveMetadata -Apply
```

## Outputs
- default staging root: `tmp/website-deploy/`
- staged content root: `tmp/website-deploy/site/`
- metadata root: `tmp/website-deploy/meta/`
  - `website-deploy-plan.json`
  - `website-deploy-last-update.json`
