Add-Type -AssemblyName System.Drawing

$b1 = [System.Drawing.Bitmap]::FromFile("assets/forest_edges/forest-edge-01.png")
$b2 = [System.Drawing.Bitmap]::FromFile("assets/forest_edges/forest-edge-02.png")

# Check an area with just leaves, e.g. x: 10..50, y: 150..250 (pure tree trunk and ferns on left, no snake)
$totalDiff = 0
$maxDiff = 0
$pixelsChecked = 0
for ($y = 150; $y -le 250; $y++) {
    for ($x = 10; $x -le 50; $x++) {
        $c1 = $b1.GetPixel($x, $y)
        $c2 = $b2.GetPixel($x, $y)
        $d = [Math]::Abs($c1.R - $c2.R) + [Math]::Abs($c1.G - $c2.G) + [Math]::Abs($c1.B - $c2.B)
        $totalDiff += $d
        if ($d -gt $maxDiff) { $maxDiff = $d }
        $pixelsChecked++
    }
}
$b1.Dispose()
$b2.Dispose()

Write-Output ("Checked $pixelsChecked pixels in pure foliage: avg diff = " + ($totalDiff / $pixelsChecked) + ", max diff = $maxDiff")
