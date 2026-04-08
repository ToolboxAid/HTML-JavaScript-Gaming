# 1. Get all .js files recursively
# 2. Look for function patterns
# 3. Group them by the text found
# 4. Filter for groups with more than 1 occurrence

# .\find_dupes_called.ps1 > found_dupes_called.txt
# .\find_dupes_called.ps1 | Out-File -FilePath "found_dupes_called.txt" -Encoding utf8

# Goes up 3 levels to reach HTML-JavaScript-Gaming from tools\shared\powerShell\
Get-ChildItem -Path "$PSScriptRoot\..\..\..\" -Recurse -Filter *.js | 
    Select-String -Pattern "function\s+[a-zA-Z0-9_]*\(", "[a-zA-Z0-9_]*\s*=\s*function", "[a-zA-Z0-9_]*:\s*function" |
    Group-Object Line | 
    Where-Object { $_.Count -gt 1 } | 
    ForEach-Object {
        # Print the duplicate line and the count
        "($($_.Count)) Duplicate line: $($_.Name.Trim())"
        
        # Loop through each occurrence in the group to show where it is
        $_.Group | ForEach-Object {
            "   -> Line $($_.LineNumber): $($_.Path)"
        }
        "" # Adds a blank line for better readability
    }
