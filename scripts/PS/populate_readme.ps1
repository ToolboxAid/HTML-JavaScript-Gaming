function Get-Description($name) {
    switch ($name.ToLower()) {
        "assets"   { return "Static resources such as images, audio, and sprites." }
        "config"   { return "Configuration files and environment settings." }
        "debug"    { return "Debug utilities, logs, and development helpers." }
        "entities" { return "Game objects, actors, and entity logic." }
        "flow"     { return "Game flow, state transitions, and control logic." }
        "game"     { return "Core game logic and orchestration." }
        "levels"   { return "Level definitions, maps, and layout data." }
        "platform" { return "Platform-specific integrations and adapters." }
        default    { return "Files related to $name functionality." }
    }
}

$root = ".\games\_template"

if (-not (Test-Path $root)) {
    Write-Host "Path not found: $root"
    exit 1
}

Get-ChildItem -Path $root -Recurse -Directory | ForEach-Object {
    $dir = $_.FullName
    $name = $_.Name
    $readmePath = Join-Path $dir "README.md"
    $desc = Get-Description $name

    $content = @"
# $name

## Purpose
$desc

## What goes here
- Files specific to this directory's responsibility
- Organized, scoped content only

## Notes
- Keep structure consistent across all games
- Do not mix responsibilities between folders
"@

    Set-Content -LiteralPath $readmePath -Value $content -Encoding UTF8
    Write-Host "Wrote: $readmePath"
}

Write-Host "Done."