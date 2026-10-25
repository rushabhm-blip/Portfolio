Add-Type -AssemblyName System.Drawing

$bmp = [System.Drawing.Bitmap]::FromFile("assets/look_closer/frame-11.png")
# Fangs are white/ivory teeth projecting down from upper jaw
# Search x: 930 to 980, y: 240 to 300
$fangPixels = @()
for ($y = 240; $y -le 300; $y++) {
    for ($x = 930; $x -le 980; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # White / ivory fangs: high R, G, B, low saturation
        if ($c.A -gt 200 -and $c.R -gt 220 -and $c.G -gt 210 -and $c.B -gt 190) {
            $fangPixels += [PSCustomObject]@{ X = $x; Y = $y; R = $c.R; G = $c.G; B = $c.B }
        }
    }
}
$bmp.Dispose()

Write-Output ("Found " + $fangPixels.Count + " fang pixels")
if ($fangPixels.Count -gt 0) {
    $minX = ($fangPixels | Measure-Object -Property X -Minimum).Minimum
    $maxX = ($fangPixels | Measure-Object -Property X -Maximum).Maximum
    $minY = ($fangPixels | Measure-Object -Property Y -Minimum).Minimum
    $maxY = ($fangPixels | Measure-Object -Property Y -Maximum).Maximum
    Write-Output ("Fang bounding box: [$minX, $minY] to [$maxX, $maxY]")
    # Lowest point is fang tip
    $tips = $fangPixels | Where-Object { $_.Y -eq $maxY }
    Write-Output ("Lowest tip pixel: (" + $tips[0].X + ", " + $tips[0].Y + ")")
}
