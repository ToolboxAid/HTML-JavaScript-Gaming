param(
    [Parameter(Mandatory=$true)][string]$ProjectFolder,
    [Parameter(Mandatory=$true)][string]$Task,
    [switch]$StripSingleLineComments
)

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

$projectRoot=(Resolve-Path $ProjectFolder).Path
$taskFolder=Join-Path $projectRoot $Task

if(Test-Path $taskFolder){Remove-Item $taskFolder -Recurse -Force}
New-Item -ItemType Directory -Path $taskFolder | Out-Null

$reports=Join-Path $taskFolder "reports"
$payload=Join-Path $taskFolder "payload"
New-Item -ItemType Directory -Force -Path $reports,$payload | Out-Null

function Get-Preview($path){
    $lines=@(Get-Content $path)
    if($StripSingleLineComments){
        $lines=@($lines | Where-Object {$_ -notmatch '^\s*//'})
    }
    $max=[Math]::Min(50,$lines.Count-1)
    if($max -lt 0){return ""}
    return ($lines[0..$max] -join "`n")
}

$files=Get-ChildItem $projectRoot -Recurse -File |
 Where-Object {$_.Extension -in ".js",".json",".md",".html",".css"} |
 Select-Object -First 120

$previews=@()
foreach($f in $files){
 $previews+=[PSCustomObject]@{
  file=$f.FullName.Substring($projectRoot.Length)
  preview=Get-Preview $f.FullName
 }
}

$previews | ConvertTo-Json -Depth 5 | Set-Content "$payload/previews.json"
Write-Host "Built task:" $Task
