Add-Type -AssemblyName System.Drawing

$b1 = [System.Drawing.Bitmap]::FromFile("assets/forest_edges/forest-edge-01.png")
$w = $b1.Width
$h = $b1.Height

for ($i = 2; $i -le 5; $i++) {
    $bi = [System.Drawing.Bitmap]::FromFile("assets/forest_edges/forest-edge-0" + $i + ".png")
    $diffCount = 0
    $minX = $w; $maxX = 0; $minY = $h; $maxY = 0
    
    # Let's cluster differences (e.g. left side vs right side)
    $diffLeft = 0; $diffRight = 0
    $minXL = $w; $maxXL = 0; $minYL = $h; $maxYL = 0
    $minXR = $w; $maxXR = 0; $minYR = $h; $maxYR = 0

    for ($y = 0; $y -lt $h; $y += 2) {
        for ($x = 0; $x -lt $w; $x += 2) {
            $c1 = $b1.GetPixel($x, $y)
            $ci = $bi.GetPixel($x, $y)
            $diff = [Math]::Abs($c1.R - $ci.R) + [Math]::Abs($c1.G - $ci.G) + [Math]::Abs($c1.B - $ci.B) + [Math]::Abs($c1.A - $ci.A)
            if ($diff -gt 35) {
                $diffCount++
                if ($x -lt ($w / 2)) {
                    $diffLeft++
                    if ($x -lt $minXL) { $minXL = $x }
                    if ($x -gt $maxXL) { $maxXL = $x }
                    if ($y -lt $minYL) { $minYL = $y }
                    if ($y -gt $maxYL) { $maxYL = $y }
                } else {
                    $diffRight++
                    if ($x -lt $minXR) { $minXR = $x }
                    if ($x -gt $maxXR) { $maxXR = $x }
                    if ($y -lt $minYR) { $minYR = $y }
                    if ($y -gt $maxYR) { $maxYR = $y }
                }
            }
        }
    }
    Write-Output ("Frame 01 vs 0$i diffs: total=" + $diffCount + " | Left diffs: " + $diffLeft + " bounds: [$minXL,$minYL] to [$maxXL,$maxYL] | Right diffs: " + $diffRight + " bounds: [$minXR,$minYR] to [$maxXR,$maxYR]")
    $bi.Dispose()
}
$b1.Dispose()
