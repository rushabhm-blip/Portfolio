Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem "assets/look_closer/frame-*.png"
foreach ($f in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
    $c0 = $bmp.GetPixel(10, 10)
    $cMid = $bmp.GetPixel($bmp.Width / 2, $bmp.Height / 2)
    Write-Output ($f.Name + " (" + $bmp.Width + "x" + $bmp.Height + ") Top-Left: A=" + $c0.A + " R=" + $c0.R + " G=" + $c0.G + " B=" + $c0.B + " | Mid: A=" + $cMid.A + " R=" + $cMid.R)
    $bmp.Dispose()
}
