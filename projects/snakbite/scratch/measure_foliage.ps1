Add-Type -AssemblyName System.Drawing

$b1 = [System.Drawing.Bitmap]::FromFile("assets/forest_edges/forest-edge-01.png")
$w = $b1.Width # 1024
$h = $b1.Height # 436

# Find rightmost non-transparent pixel on left side (x < w/2)
$leftEdgeMaxX = 0
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt ($w / 2); $x++) {
        if ($b1.GetPixel($x, $y).A -gt 15) {
            if ($x -gt $leftEdgeMaxX) { $leftEdgeMaxX = $x }
        }
    }
}

# Find leftmost non-transparent pixel on right side (x > w/2)
$rightEdgeMinX = $w
for ($y = 0; $y -lt $h; $y++) {
    for ($x = $w - 1; $x -ge ($w / 2); $x--) {
        if ($b1.GetPixel($x, $y).A -gt 15) {
            if ($x -lt $rightEdgeMinX) { $rightEdgeMinX = $x }
        }
    }
}

$b1.Dispose()

Write-Output ("Left foliage bounds: x = 0 to " + $leftEdgeMaxX + " (" + ($leftEdgeMaxX / $w * 100) + "%)")
Write-Output ("Right foliage bounds: x = " + $rightEdgeMinX + " to 1024 (" + ((1024 - $rightEdgeMinX) / $w * 100) + "%)")
Write-Output ("Clear center span: x = " + $leftEdgeMaxX + " to " + $rightEdgeMinX + " (width = " + ($rightEdgeMinX - $leftEdgeMaxX) + " or " + (($rightEdgeMinX - $leftEdgeMaxX) / $w * 100) + "%)")
