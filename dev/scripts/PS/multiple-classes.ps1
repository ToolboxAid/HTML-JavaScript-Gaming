# Define the regex pattern for a JS class declaration
# Matches "class" followed by a word (the name) and an optional "extends" keyword
$classRegex = "\bclass\s+\w+(\s+extends\s+\w+)?\s*\{"

Get-ChildItem -Filter *.js -Recurse | ForEach-Object {
    # Search for all matches of the class declaration pattern
    $results = Select-String -Path $_.FullName -Pattern $classRegex -AllMatches
    
    # If 2 or more distinct classes are found, report it
    if ($results.Matches.Count -ge 2) {
        [PSCustomObject]@{
            FileName   = $_.FullName
            ClassCount = $results.Matches.Count
        }
    }
} | Format-Table -AutoSize
