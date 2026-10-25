Add-Type -AssemblyName System.Drawing

# Inspect head area of frame-01 (rat snake) and frame-06 (viper)
# Head is around x: 900 to 1000, y: 220 to 300
function FindDarkestSpot($imgPath, $x1, $y1, $x2, $y2) {
    $bmp = [System.Drawing.Bitmap]::FromFile($imgPath)
    $minBrightness = 999
    $darkX = 0
    $darkY = 0
    for ($y = $y1; $y -le $y2; $y++) {
        for ($x = $x1; $x -le $x2; $x++) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.A -gt 200) {
                $b = ($c.R + $c.G + $c.B)
                if ($b -lt $minBrightness) {
                    $minBrightness = $b
                    $darkX = $x
                    $darkY = $y
                }
            }
        }
    }
    $bmp.Dispose()
    return [PSCustomObject]@{ X = $darkX; Y = $darkY; Brightness = $minBrightness }
}

$eye1 = FindDarkestSpot "assets/look_closer/frame-01.png" 910 230 960 270
Write-Output ("Frame 01 Eye estimate: (" + $eye1.X + ", " + $eye1.Y + ")")

$eye6 = FindDarkestSpot "assets/look_closer/frame-06.png" 910 230 960 270
Write-Output ("Frame 06 Eye estimate: (" + $eye6.X + ", " + $eye6.Y + ")")

$eye11 = FindDarkestSpot "assets/look_closer/frame-11.png" 910 230 960 270
Write-Output ("Frame 11 Eye estimate: (" + $eye11.X + ", " + $eye11.Y + ")")
