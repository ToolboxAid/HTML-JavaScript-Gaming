$targets = @(
    ".\samples",
    ".\tools"
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