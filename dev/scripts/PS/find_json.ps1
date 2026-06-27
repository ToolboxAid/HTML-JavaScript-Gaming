$project = "C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming"
$artifactTmp = Join-Path $project "dev\workspace\tmp"
$outputPath = Join-Path $artifactTmp "asteroids-json-list.txt"

New-Item -ItemType Directory -Path $artifactTmp -Force | Out-Null

Get-ChildItem "$project\games\Asteroids" -Recurse -Filter *.json |
Sort-Object FullName |
ForEach-Object {
    $_.FullName.Replace("$project\", "")
} | Set-Content $outputPath

Get-Content $outputPath
