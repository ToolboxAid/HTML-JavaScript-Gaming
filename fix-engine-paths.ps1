# Fix engine paths after moving /engine to /src/engine
# This script safely replaces engine paths while avoiding double-replacements

param(
    [switch]$ShowDetails
)

$workspaceRoot = Get-Location
$changedFiles = 0
$totalMatches = 0

Write-Host "=== Engine Path Migration Tool ===" -ForegroundColor Cyan
Write-Host "Fixing paths: /engine/ to /src/engine/" -ForegroundColor Gray
Write-Host ""

# Process all relevant files
Get-ChildItem -Recurse -Include *.js,*.mjs,*.html,*.jsx,*.ts,*.tsx,*.md -ErrorAction SilentlyContinue |
    Where-Object {
        $path = $_.FullName
        # Skip excluded directories
        -not ($path -match '\\(node_modules|\.git|dist|build|\.next|tmp)\\')
    } |
    ForEach-Object {
        $file = $_
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($null -ne $content) {
            $originalContent = $content
            
            # Fix double src/src replacements first
            $content = $content -replace '/src/src/engine/', '/src/engine/'
            
            # Replace /engine/ with /src/engine/ (for absolute paths)
            $content = $content -replace '(?<!src)/engine/', '/src/engine/'
            
            if ($content -ne $originalContent) {
                try {
                    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
                    $changedFiles++
                    
                    $matches = @($originalContent | Select-String '/engine/' -AllMatches).Count
                    $totalMatches += $matches
                    
                    if ($ShowDetails) {
                        Write-Host "OK: $($file.Name)" -ForegroundColor Green
                    }
                }
                catch {
                    Write-Host "Error: $($file.Name)" -ForegroundColor Red
                }
            }
        }
    }

Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Cyan
Write-Host "Files updated: $changedFiles" -ForegroundColor Green
Write-Host "Total paths fixed: $totalMatches" -ForegroundColor Green
Write-Host ""
Write-Host "Complete!" -ForegroundColor Green
