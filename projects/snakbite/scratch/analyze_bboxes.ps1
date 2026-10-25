Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem "assets/look_closer/frame-*.png"
foreach ($f in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
    $minX = $bmp.Width
    $maxX = 0
    $minY = $bmp.Height
    $maxY = 0

    for ($y = 0; $y -lt $bmp.Height; $y += 2) {
        for ($x = 0; $x -lt $bmp.Width; $x += 2) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.A -gt 15) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    
    # Also find snout tip (rightmost point with high alpha)
    $snoutX = 0
    $snoutY = 0
    for ($x = $maxX; $x -ge $maxX - 60; $x--) {
        for ($y = $minY; $y -le $maxY; $y++) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.A -gt 50) {
                if ($x -gt $snoutX) {
                    $snoutX = $x
                    $snoutY = $y
                }
            }
        }
    }

    Write-Output ($f.Name + " bbox: [" + $minX + "," + $minY + "] to [" + $maxX + "," + $maxY + "] (w=" + ($maxX-$minX) + ", h=" + ($maxY-$minY) + ") | Snout: (" + $snoutX + "," + $snoutY + ")")
    $bmp.Dispose()
}
