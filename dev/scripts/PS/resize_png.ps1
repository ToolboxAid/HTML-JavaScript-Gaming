Add-Type -AssemblyName System.Drawing

Get-ChildItem -File | Where-Object {
    $_.BaseName -like "*-1024*"
} | ForEach-Object {
    $inputFile = $_.FullName
    $outputName = $_.Name -replace "-1024", ""
    $outputFile = Join-Path $_.DirectoryName $outputName

    $img = [System.Drawing.Image]::FromFile($inputFile)

    try {
        if ($img.Width -eq 1024 -and $img.Height -eq 1024) {
            $newWidth = 64
            $newHeight = 64
        }
        elseif ($img.Width -eq 1672 -and $img.Height -eq 941) {
            $newWidth = 400
            $newHeight = 225
        }
        else {
            Write-Host "Skipping $($_.Name): $($img.Width)x$($img.Height)"
            return
        }

        $bmp = New-Object System.Drawing.Bitmap $newWidth, $newHeight
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.DrawImage($img, 0, 0, $newWidth, $newHeight)

        $bmp.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)

        Write-Host "Created $outputName from $($_.Name) -> ${newWidth}x${newHeight}"
    }
    finally {
        if ($g) { $g.Dispose() }
        if ($bmp) { $bmp.Dispose() }
        $img.Dispose()
    }
}