$targets = @(
    ".\samples",
    ".\tools",
    ".\games\AITargetDummy",
    ".\games\Asteroids",
    ".\games\Bouncing-ball",
    ".\games\GravityWell",
    ".\games\Pong",
    ".\games\SolarSystem",
    ".\games\SpaceInvaders"
)

foreach ($path in $targets) {
    if (Test-Path $path) {
        Write-Host "Processing: $path"

        Get-ChildItem -Path $path -Recurse -Force -Filter ".gitkeep" -File |
            ForEach-Object {
                Write-Host "Deleting: $($_.FullName)"
                Remove-Item -LiteralPath $_.FullName -Force
            }
    }
    else {
        Write-Host "Path not found: $path"
    }
}

Write-Host "Done."