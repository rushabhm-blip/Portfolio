Add-Type -AssemblyName System.Drawing

$bmp = [System.Drawing.Bitmap]::FromFile("assets/look_closer/frame-11.png")
Write-Output ("Width: " + $bmp.Width + ", Height: " + $bmp.Height)
# Check row 428, 429, 430
for ($y = 425; $y -le 431; $y++) {
    $nonZero = 0
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        if ($bmp.GetPixel($x, $y).A -gt 10) { $nonZero++ }
    }
    Write-Output ("Row $y non-zero pixels: $nonZero")
}
$bmp.Dispose()
