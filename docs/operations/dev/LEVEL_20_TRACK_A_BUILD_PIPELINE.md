# Level 20 Track A Build Pipeline Definition

## Purpose
Define the Track A build and release-readiness command sequence used for validation and gating.

## Pipeline stages
1. Structure validation
   - `.\scripts\PS\validate\Validate-ScriptStructure.ps1`
2. Deployment staging prep (apply mode)
   - `.\scripts\PS\deploy\Prep-WebsiteRepoDeployment.ps1 -StagingRoot <repo>\tmp\website-deploy-track20a -IncludePaths index.html,games/index.html,samples/index.html,tools/index.html -Apply`
3. Deployment update + verification (apply mode)
   - `.\scripts\PS\deploy\Update-WebsiteRepoDeployment.ps1 -StagingRoot <repo>\tmp\website-deploy-track20a -IncludePaths index.html,games/index.html,samples/index.html,tools/index.html -Apply -ConfirmDestructive`
4. Deployment cleanup (apply mode)
   - `.\scripts\PS\deploy\Clean-WebsiteRepoDeployment.ps1 -StagingRoot <repo>\tmp\website-deploy-track20a -Apply -ConfirmDestructive -RemoveMetadata`

## Success conditions
1. Script structure returns PASS.
2. Prep stage writes deployment plan and docker artifacts.
3. Update stage writes verification report with no failed checks.
4. Clean stage removes staged site content (`site/` absent after cleanup).

## Notes
1. This definition is Track A specific and release-readiness scoped.
2. Runtime feature behavior is out of scope for this pipeline document.
