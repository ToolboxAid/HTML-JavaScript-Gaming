# ToolboxAid
# This script moves preview.svg files from sample folders to their respective assets folders.
# Usage:
#   .\move-preview-svg-to-assets.ps1 -RepoRoot "path\to\repo" [-WhatIf]
# Parameters:
#   -RepoRoot: The root directory of the repository. Default is the current directory.  
#   -WhatIf: If specified, the script will only print the actions it would take without making any changes. 
# Example:
#   .\move-preview-svg-to-assets.ps1 -RepoRoot "C:\Projects\    MyRepo" -WhatIf 
# Note: This script assumes that the sample folders are located under a "samples" directory in the repository and that they are named with a four-digit format (e.g., 0001, 0002, etc.). Each sample folder may contain a preview.svg file that needs to be moved to an assets subfolder within the same sample folder. If the assets folder does not exist, it will be created.
#

param(
    [string]$RepoRoot = ".",
    [switch]$WhatIf
)

$RepoRoot = (Resolve-Path $RepoRoot).Path
Write-Host "Repo root: $RepoRoot"

$sampleDirs = Get-ChildItem -Path (Join-Path $RepoRoot "samples") -Directory -Recurse |
    Where-Object { $_.Name -match '^\d{4}$' }

$moveCount = 0
$skipCount = 0
$errorCount = 0

foreach ($sampleDir in $sampleDirs) {
    $sourceFile = Join-Path $sampleDir.FullName "preview.svg"
    if (-not (Test-Path $sourceFile)) {
        $skipCount++
        continue
    }

    $assetsDir = Join-Path $sampleDir.FullName "assets"
    $destFile = Join-Path $assetsDir "preview.svg"

    try {
        if (-not (Test-Path $assetsDir)) {
            if ($WhatIf) {
                Write-Host "[WhatIf] Create folder: $assetsDir"
            } else {
                New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
            }
        }

        if ($WhatIf) {
            Write-Host "[WhatIf] Move $sourceFile -> $destFile"
        } else {
            Move-Item -Path $sourceFile -Destination $destFile -Force
            Write-Host "Moved: $sourceFile -> $destFile"
        }

        $moveCount++
    }
    catch {
        Write-Warning "Failed: $sourceFile -> $destFile"
        Write-Warning $_.Exception.Message
        $errorCount++
    }
}

Write-Host ""
Write-Host "Done."
Write-Host "Moved : $moveCount"
Write-Host "Skipped: $skipCount"
Write-Host "Errors : $errorCount"