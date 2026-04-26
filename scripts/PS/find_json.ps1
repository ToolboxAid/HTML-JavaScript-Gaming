$project = "C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming"

Get-ChildItem "$project\games\Asteroids" -Recurse -Filter *.json |
Sort-Object FullName |
ForEach-Object {
    $_.FullName.Replace("$project\", "")
} | Set-Content "$project\asteroids-json-list.txt"