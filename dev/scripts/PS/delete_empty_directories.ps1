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

$exclude = @(
    (Resolve-Path ".\games\_template").Path
)

foreach ($path in $targets) {
    if (Test-Path $path) {
        Write-Host "Processing: $path"

        Get-ChildItem -Path $path -Recurse -Directory -Force |
        Sort-Object FullName -Descending |
        ForEach-Object {
            $full = $_.FullName

            # Skip excluded paths
            if ($exclude | Where-Object { $full.StartsWith($_) }) { return }

            # Remove if empty
            if (-not (Get-ChildItem -LiteralPath $full -Force)) {
                Write-Host "Removing: $full"
                Remove-Item -LiteralPath $full -Force
            }
        }
    }
}

Write-Host "Done."