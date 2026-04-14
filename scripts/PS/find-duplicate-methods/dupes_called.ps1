# 1. Get all .js files recursively
# 2. Look for function patterns
# 3. Group them by the text found
# 4. Filter for groups with more than 1 occurrence

# .\find_dupes_called.ps1 > found_dupes_called.txt
# .\find_dupes_called.ps1 | Out-File -FilePath "found_dupes_called.txt" -Encoding utf8

# Goes up 3 levels to reach HTML-JavaScript-Gaming from tools\shared\powerShell\
# Get the root path (3 levels up)
$rootPath = Resolve-Path "$PSScriptRoot\..\..\..\"

Get-ChildItem -Path $rootPath -Recurse -Filter *.js | 
    Select-String -Pattern "function\s+[a-zA-Z0-9_]*\(", "[a-zA-Z0-9_]*\s*=\s*function", "[a-zA-Z0-9_]*:\s*function" |
    Group-Object Line | 
    Where-Object { $_.Count -gt 1 } | 
    ForEach-Object {
        "($($_.Count)) Duplicate line: $($_.Name.Trim())"
        
        $_.Group | ForEach-Object {
            # Replace the absolute root path with a single backslash
            $relativePath = $_.Path -replace [regex]::Escape($rootPath), ""
            "   -> Line $($_.LineNumber): \$relativePath"
        }
        "" 
    }

